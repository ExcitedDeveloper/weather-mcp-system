# MCP Weather Advice Workflow Diagrams

This directory contains multiple diagram formats for visualizing the **MCP Weather Advice Tool Workflow**. Choose the format that works best with your preferred diagramming software.

## 📊 Available Formats

### 1. **Mermaid Diagram** (`mcp-weather-advice-workflow.mmd`)
**Best for:** GitHub README files, documentation, VS Code

**How to use:**
- **GitHub**: Paste the content in README.md code blocks with `mermaid` language
- **Mermaid Live Editor**: Go to [mermaid.live](https://mermaid.live) and paste the content
- **VS Code**: Install Mermaid preview extensions
- **Online tools**: Many support Mermaid syntax

**Features:**
- Clean, modern styling
- Color-coded components
- Interactive in some viewers

### 2. **PlantUML Diagram** (`mcp-weather-advice-workflow.puml`)
**Best for:** Technical documentation, sequence diagrams

**How to use:**
- **Online**: Go to [plantuml.com/plantuml](http://www.plantuml.com/plantuml/uml/) and paste the content
- **VS Code**: Install PlantUML extensions
- **IntelliJ/Eclipse**: Built-in PlantUML support
- **Command line**: Install PlantUML locally

**Features:**
- Detailed sequence diagram format
- Shows exact message flow
- Professional technical documentation style

### 3. **Graphviz DOT** (`mcp-weather-advice-workflow.dot`)
**Best for:** Publication-quality diagrams, research papers

**How to use:**
- **Online**: Search for "Graphviz online" or "DOT graph online"
- **Command line**: `dot -Tpng mcp-weather-advice-workflow.dot -o workflow.png`
- **Local software**: Install Graphviz package

**Features:**
- Hierarchical layout
- Precise positioning
- High-quality output formats (PNG, SVG, PDF)

### 4. **Draw.io/Diagrams.net** (`mcp-weather-advice-workflow.drawio`)
**Best for:** Interactive editing, presentations, collaboration

**How to use:**
- **Online**: Go to [diagrams.net](https://app.diagrams.net) and open the file
- **Desktop**: Download Draw.io desktop app
- **VS Code**: Install Draw.io integration extension
- **Google Drive**: Draw.io Google Drive app

**Features:**
- Drag-and-drop editing
- Professional styling
- Export to many formats
- Easy collaboration

## 🔄 Workflow Overview

The diagram shows the complete data flow for the **get_weather_advice** MCP tool:

### 1. **Client Request** (JSON-RPC)
```json
{
  "method": "tools/call",
  "params": {
    "name": "get_weather_advice", 
    "arguments": {
      "location": "Chicago, IL",
      "temperature_unit": "fahrenheit"
    }
  }
}
```

### 2. **MCP Server Processing**
- Schema validation
- Tool routing
- Input sanitization

### 3. **Advice Engine Processing**
- Location parsing & geocoding
- Weather API data retrieval
- Temperature conversion (Celsius → Fahrenheit)
- Multi-factor analysis:
  - **Clothing recommendations** (6 temperature ranges)
  - **Activity suggestions** (outdoor/indoor/travel)
  - **Weather warnings** (safety-based)

### 4. **Response Formatting**
```
🎯 Weather Advice for Chicago, Illinois, United States
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌡️ Current: 64°F - Overcast
💧 Humidity: 88%
💨 Wind: 8.7 km/h

👔 CLOTHING RECOMMENDATIONS:
• T-shirt or light long sleeves
• Comfortable pants, jeans, or shorts

🏃 ACTIVITY RECOMMENDATIONS:
• Perfect outdoor weather
• Ideal for all outdoor sports
```

### 5. **MCP Response** (JSON-RPC)
```json
{
  "result": {
    "content": [{
      "type": "text",
      "text": "🎯 Weather Advice for Chicago..."
    }]
  }
}
```

## 🌡️ Temperature Logic

The recommendation engine uses 6 temperature ranges:

| Range | Clothing | Activities |
|-------|----------|------------|
| < 20°F | Heavy winter gear, layers | Limited outdoor exposure |
| 20-40°F | Heavy jacket, warm clothes | Outdoor with warm clothing |
| 40-60°F | Light jacket, layers | Excellent outdoor weather |
| **60-75°F** | **T-shirt, comfortable** | **Perfect outdoor weather** |
| 75-85°F | Light clothing, sun protection | Stay hydrated |
| > 85°F | Minimal clothing, cooling | Limit midday activities |

## 🌦️ Weather Condition Logic

The system also considers weather conditions:

- **Rain** → Umbrella, waterproof gear
- **Snow** → Winter boots, traction warnings  
- **Wind** → Wind-resistant clothing
- **Thunderstorms** → Indoor shelter warnings
- **Fog** → Visibility and driving warnings

## 🛠️ Technical Implementation

**Key Components:**
- **MCP Protocol**: JSON-RPC communication, schema validation
- **External APIs**: Open-Meteo weather and geocoding (free, no API keys)
- **Temperature Conversion**: API Celsius → User preference (°F/°C)
- **Modular Architecture**: Separate modules for validation, geocoding, weather, advice
- **Error Handling**: Graceful failures, user-friendly messages

**Files Involved:**
- `schemas.ts` - MCP tool definition
- `tools/index.ts` - Tool handler
- `advice.ts` - Recommendation engine
- `geocoding.ts` - Location parsing
- `weather.ts` - Weather data retrieval
- `validation.ts` - Input validation
- `formatters.ts` - Output formatting

This implementation demonstrates how to build sophisticated, context-aware tools that integrate seamlessly with the MCP protocol while providing real practical value to users.