import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import { requireAuth, getCurrentUser } from '../../utils/adminMiddleware';

export const POST: APIRoute = async (context) => {
  const { request, cookies, redirect } = context;
  try {
    // Check authentication
    const authCheck = requireAuth(context);
    if (authCheck) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get current user
    const currentUser = getCurrentUser(context);
    if (!currentUser) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const formData = await request.formData();
    const filename = formData.get('filename') as string;

    if (!filename) {
      return new Response(JSON.stringify({ success: false, error: 'Filename is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate filename
    if (!filename.endsWith('.mdx')) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid file type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if filename contains path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid filename' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const contentDir = path.join(process.cwd(), 'src', 'content', 'blog');
    const filePath = path.join(contentDir, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return new Response(JSON.stringify({ success: false, error: 'File not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete the file
    fs.unlinkSync(filePath);

    console.log(`File deleted: ${filename} by user: ${currentUser.username}`);

    return new Response(JSON.stringify({ success: true, message: `File ${filename} deleted successfully` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Delete content error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};