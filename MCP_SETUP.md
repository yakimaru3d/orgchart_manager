# MCP Server Setup Guide

This project is configured with multiple Model Context Protocol (MCP) servers to enhance AI assistance capabilities.

## Configured MCP Servers

### 1. Context7 (`context7`)
- **Purpose**: Up-to-date library documentation and code examples
- **Package**: `@upstash/context7-mcp`
- **Status**: ✅ Ready to use
- **Usage**: Automatically provides current documentation when working with libraries

### 2. Magic (`magic`)
- **Purpose**: AI-powered UI component generation
- **Package**: `@21st-dev/magic`
- **Status**: ⚠️ Requires API key
- **Setup Required**:
  1. Sign up at https://21st.dev/magic/console
  2. Get your API key (5 free requests, then $20/month)
  3. Set environment variable: `TWENTY_FIRST_API_KEY=your_api_key`

### 3. Sequential Thinking (`sequential-thinking`)
- **Purpose**: Structured problem-solving and analysis
- **Package**: `@modelcontextprotocol/server-sequential-thinking`
- **Status**: ✅ Ready to use
- **Usage**: Enables systematic thinking and problem decomposition

### 4. Supabase (`supabase`)
- **Purpose**: Database operations and authentication
- **Package**: `@supabase/mcp-server-supabase`
- **Status**: ✅ Configured (uses project environment variables)

## Environment Variables

Make sure to set these environment variables in your `.env.local` file:

```env
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 21st.dev Magic (optional, for UI generation)
TWENTY_FIRST_API_KEY=your_21st_dev_api_key
```

## Troubleshooting

If MCP servers fail to connect:

1. **Check Node.js version**: Ensure you have Node.js v18+ installed
2. **Restart Claude Code**: After modifying `.mcp.json`, restart Claude Code
3. **Check environment variables**: Ensure all required environment variables are set
4. **Network issues**: Some servers require internet access for package downloads

## Usage Tips

- **Context7**: Just mention "use context7" or reference a library to get up-to-date documentation
- **Magic**: Ask for UI components like "create a modern button component"
- **Sequential Thinking**: Use for complex analysis with phrases like "think step by step"
- **Supabase**: Database operations will automatically use this server when available