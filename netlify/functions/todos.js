// In-memory persistent fallback store for local execution & serverless session caching
let memoryStore = [
  {
    id: "1",
    text: "Welcome to Taskflow! 👋",
    completed: false,
    priority: "medium",
    category: "General",
    dueDate: "",
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    text: "Explore priority levels & category tags",
    completed: true,
    priority: "high",
    category: "Work",
    dueDate: "",
    createdAt: new Date().toISOString()
  },
  {
    id: "3",
    text: "Serverless Netlify Functions API active ⚡",
    completed: false,
    priority: "high",
    category: "Dev",
    dueDate: "",
    createdAt: new Date().toISOString()
  }
];

// Simple in-memory Rate Limiting (IP tracking)
const requestTracker = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MIN = 60;

function isRateLimited(clientIp) {
  const now = Date.now();
  const clientData = requestTracker.get(clientIp) || { count: 0, startTime: now };

  if (now - clientData.startTime > RATE_LIMIT_WINDOW_MS) {
    clientData.count = 1;
    clientData.startTime = now;
  } else {
    clientData.count += 1;
  }

  requestTracker.set(clientIp, clientData);
  return clientData.count > MAX_REQUESTS_PER_MIN;
}

// XSS Sanitization helper
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .trim();
}

exports.handler = async (event, context) => {
  const clientIp = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown';
  
  // Rate limiting check
  if (isRateLimited(clientIp)) {
    return {
      statusCode: 429,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Too many requests. Please slow down.' })
    };
  }

  const path = event.path.replace(/\/\.netlify\/functions\/todos|\/api\/todos/, '');
  const method = event.httpMethod;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS'
  };

  if (method === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    // GET /api/todos
    if (method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: memoryStore })
      };
    }

    // POST /api/todos
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      
      if (!body.text || typeof body.text !== 'string' || body.text.trim().length === 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, error: 'Task text is required.' })
        };
      }

      const newTodo = {
        id: String(Date.now()),
        text: sanitizeString(body.text).slice(0, 255),
        completed: Boolean(body.completed),
        priority: ['low', 'medium', 'high'].includes(body.priority) ? body.priority : 'medium',
        category: sanitizeString(body.category || 'General').slice(0, 30),
        dueDate: body.dueDate ? sanitizeString(body.dueDate) : '',
        createdAt: new Date().toISOString()
      };

      memoryStore.unshift(newTodo);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ success: true, data: newTodo })
      };
    }

    // PATCH /api/todos
    if (method === 'PATCH') {
      const body = JSON.parse(event.body || '{}');
      if (!body.id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, error: 'Task ID is required for update.' })
        };
      }

      let updatedItem = null;
      memoryStore = memoryStore.map(todo => {
        if (todo.id === String(body.id)) {
          updatedItem = {
            ...todo,
            completed: body.completed !== undefined ? Boolean(body.completed) : todo.completed,
            text: body.text ? sanitizeString(body.text).slice(0, 255) : todo.text,
            priority: ['low', 'medium', 'high'].includes(body.priority) ? body.priority : todo.priority,
            category: body.category ? sanitizeString(body.category).slice(0, 30) : todo.category,
            dueDate: body.dueDate !== undefined ? sanitizeString(body.dueDate) : todo.dueDate,
            updatedAt: new Date().toISOString()
          };
          return updatedItem;
        }
        return todo;
      });

      if (!updatedItem) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ success: false, error: 'Todo item not found.' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: updatedItem })
      };
    }

    // DELETE /api/todos?id=123 OR /api/todos (clear completed)
    if (method === 'DELETE') {
      const params = event.queryStringParameters || {};
      const id = params.id;
      const clearCompleted = params.clearCompleted === 'true';

      if (clearCompleted) {
        memoryStore = memoryStore.filter(t => !t.completed);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Cleared completed items.' })
        };
      }

      if (id) {
        memoryStore = memoryStore.filter(t => t.id !== String(id));
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Item deleted.' })
        };
      }

      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Provide id or clearCompleted parameter.' })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method Not Allowed' })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: 'Internal Server Error', details: err.message })
    };
  }
};
