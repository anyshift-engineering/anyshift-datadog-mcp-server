# Anyshift Datadog MCP Server

> **Enhanced fork** of the original [mcp-server-datadog](https://github.com/winor30/mcp-server-datadog) by [@winor30](https://github.com/winor30), developed and maintained by [Anyshift](https://github.com/anyshift-engineering). This version includes additional features for JSON processing, file writing capabilities, and enhanced observability tools.

[![Build Status](https://github.com/anyshift-engineering/mcp-server-datadog/workflows/CI/badge.svg)](https://github.com/anyshift-engineering/mcp-server-datadog/actions)

A comprehensive MCP server for the Datadog API, enabling advanced incident management, observability, and data analysis workflows.

## ✨ Anyshift Enhancements

This fork includes several powerful enhancements beyond the original implementation:

- **🔍 JQ Query Tool** - Advanced JSON processing and analysis capabilities with security controls
- **💾 File Writing System** - Configurable response persistence with structured output and schema analysis
- **⏰ Timestamp Adjustment** - Evaluation timestamp support for controlled data timeframes
- **🛠️ Enhanced Tooling** - Comprehensive coverage of Datadog APIs with improved error handling
- **🏗️ Modular Architecture** - Clean, extensible design for easy feature additions

## Features

- **Complete Datadog Integration**: Full access to incidents, monitors, logs, dashboards, metrics, traces, hosts, downtimes, and RUM data
- **Advanced Data Processing**: Built-in JSON querying and transformation capabilities
- **Flexible Output Options**: Direct responses or structured file output with automatic schema generation
- **Security-First Design**: Input validation and sanitization throughout
- **Developer-Friendly**: Comprehensive debugging tools and clear documentation

## Tools Overview

### 📊 **Observability & Monitoring**

- `list_incidents` / `get_incident` - Incident management
- `get_monitors` - Monitor status and configuration
- `query_metrics` - Metrics data retrieval
- `search_logs` / `get_logs` / `list_logs` - Log analysis
- `list_traces` - APM trace investigation

### 📈 **Dashboards & Visualization**

- `list_dashboards` / `get_dashboard` - Dashboard management
- `create_dashboard` / `update_dashboard` - Dashboard creation and updates

### 🖥️ **Infrastructure Management**

- `list_hosts` / `get_host` - Host inventory and details
- `mute_host` / `unmute_host` - Host muting controls
- `get_active_hosts_count` - Active host metrics

### ⏰ **Downtime Management**

- `list_downtimes` - Scheduled downtime overview
- `schedule_downtime` - Create maintenance windows
- `cancel_downtime` - Cancel scheduled downtimes

### 📱 **Real User Monitoring (RUM)**

- `get_rum_applications` - RUM application inventory
- `get_rum_events` - RUM event analysis
- `get_rum_grouped_event_count` - Aggregated RUM metrics
- `get_rum_page_performance` - Page performance analytics
- `get_rum_page_waterfall` - Detailed page load analysis

### 🔧 **Data Processing (Anyshift Enhancement)**

- `execute_jq_query` - Advanced JSON processing with security controls

## Detailed Tool Documentation

<details>
<summary><strong>Incident Management</strong></summary>

### `list_incidents`

Retrieve a list of incidents from Datadog.

- **Inputs**:
  - `filter` (optional string): Filter parameters for incidents (e.g., status, priority)
  - `pagination` (optional object): Pagination details like page size/offset
- **Returns**: Array of Datadog incidents and associated metadata

### `get_incident`

Retrieve detailed information about a specific Datadog incident.

- **Inputs**:
  - `incident_id` (string): Incident ID to fetch details for
- **Returns**: Detailed incident information (title, status, timestamps, etc.)

</details>

<details>
<summary><strong>Monitoring & Metrics</strong></summary>

### `get_monitors`

Fetch the status of Datadog monitors.

- **Inputs**:
  - `groupStates` (optional array): States to filter (e.g., alert, warn, no data, ok)
  - `name` (optional string): Filter by name
  - `tags` (optional array): Filter by tags
- **Returns**: Monitors data and a summary of their statuses

### `query_metrics`

Retrieve metrics data from Datadog.

- **Inputs**:
  - `query` (string): Metrics query string
  - `from` (number): Start time in epoch seconds
  - `to` (number): End time in epoch seconds
- **Returns**: Metrics data for the queried timeframe

</details>

<details>
<summary><strong>Logs & Traces</strong></summary>

### `get_logs`

Search and retrieve logs from Datadog.

- **Inputs**:
  - `query` (string): Datadog logs query string
  - `from` (number): Start time in epoch seconds
  - `to` (number): End time in epoch seconds
  - `limit` (optional number): Maximum number of logs to return (defaults to 100)
- **Returns**: Array of matching logs

### `list_traces`

Retrieve a list of APM traces from Datadog.

- **Inputs**:
  - `query` (string): Datadog APM trace query string
  - `from` (number): Start time in epoch seconds
  - `to` (number): End time in epoch seconds
  - `limit` (optional number): Maximum number of traces to return (defaults to 100)
  - `sort` (optional string): Sort order for traces (defaults to '-timestamp')
  - `service` (optional string): Filter by service name
  - `operation` (optional string): Filter by operation name
- **Returns**: Array of matching traces from Datadog APM

</details>

<details>
<summary><strong>Dashboards</strong></summary>

### `list_dashboards`

Get a list of dashboards from Datadog.

- **Inputs**:
  - `name` (optional string): Filter dashboards by name
  - `tags` (optional array): Filter dashboards by tags
- **Returns**: Array of dashboards with URL references

### `get_dashboard`

Retrieve a specific dashboard from Datadog.

- **Inputs**:
  - `dashboard_id` (string): ID of the dashboard to fetch
- **Returns**: Dashboard details including title, widgets, etc.

</details>

<details>
<summary><strong>Host Management</strong></summary>

### `list_hosts`

Get list of hosts from Datadog.

- **Inputs**:
  - `filter` (optional string): Filter string for search results
  - `sort_field` (optional string): Field to sort hosts by
  - `sort_dir` (optional string): Sort direction (asc/desc)
  - `start` (optional number): Starting offset for pagination
  - `count` (optional number): Max number of hosts to return (max: 1000)
  - `from` (optional number): Search hosts from this UNIX timestamp
  - `include_muted_hosts_data` (optional boolean): Include muted hosts status and expiry
  - `include_hosts_metadata` (optional boolean): Include host metadata (version, platform, etc)
- **Returns**: Array of hosts with details including name, ID, aliases, apps, mute status, and more

### `mute_host`

Mute a host in Datadog.

- **Inputs**:
  - `hostname` (string): The name of the host to mute
  - `message` (optional string): Message to associate with the muting of this host
  - `end` (optional number): POSIX timestamp for when the mute should end
  - `override` (optional boolean): If true and the host is already muted, replaces existing end time
- **Returns**: Success status and confirmation message

</details>

<details>
<summary><strong>Downtime Management</strong></summary>

### `list_downtimes`

List scheduled downtimes from Datadog.

- **Inputs**:
  - `currentOnly` (optional boolean): Return only currently active downtimes when true
  - `monitorId` (optional number): Filter by monitor ID
- **Returns**: Array of scheduled downtimes with details including scope, monitor information, and schedule

### `schedule_downtime`

Schedule a downtime in Datadog.

- **Inputs**:
  - `scope` (string): Scope to apply downtime to (e.g. 'host:my-host')
  - `start` (optional number): UNIX timestamp for the start of the downtime
  - `end` (optional number): UNIX timestamp for the end of the downtime
  - `message` (optional string): A message to include with the downtime
  - `timezone` (optional string): The timezone for the downtime (e.g. 'UTC', 'America/New_York')
  - `monitorId` (optional number): The ID of the monitor to mute
  - `monitorTags` (optional array): A list of monitor tags for filtering
  - `recurrence` (optional object): Recurrence settings for the downtime
- **Returns**: Scheduled downtime details including ID and active status

</details>

<details>
<summary><strong>RUM Analytics</strong></summary>

### `get_rum_applications`

Get all RUM applications in the organization.

- **Inputs**: None
- **Returns**: List of RUM applications

### `get_rum_events`

Search and retrieve RUM events from Datadog.

- **Inputs**:
  - `query` (string): Datadog RUM query string
  - `from` (number): Start time in epoch seconds
  - `to` (number): End time in epoch seconds
  - `limit` (optional number): Maximum number of events to return (default: 100)
- **Returns**: Array of RUM events

### `get_rum_page_performance`

Get page (view) performance metrics from RUM data.

- **Inputs**:
  - `query` (optional string): Additional query filter for RUM search (default: "\*")
  - `from` (number): Start time in epoch seconds
  - `to` (number): End time in epoch seconds
  - `metricNames` (array of strings): Array of metric names to retrieve
- **Returns**: Performance metrics including average, min, max, and count for each metric

</details>

<details>
<summary><strong>JSON Processing (Anyshift Enhancement)</strong></summary>

### `execute_jq_query`

Advanced JSON processing and analysis tool with security controls.

- **Inputs**:
  - `jq_query` (string): jq query string for JSON processing
  - `file_path` (string): Absolute path to JSON file to process
  - `description` (optional string): Description of the operation
- **Returns**: Processed JSON data according to the query
- **Security**: Blocks environment variable access and system information queries
- **Examples**:
  - `.users[].name` - Extract user names
  - `.data | length` - Count items
  - `.[].status | select(. == "active")` - Filter by status

</details>

## Setup

### Environment Variables

#### **Required Datadog Credentials**

```bash
export DATADOG_API_KEY="your_api_key"
export DATADOG_APP_KEY="your_app_key"
export DATADOG_SITE="your_datadog_site"  # Optional, defaults to datadoghq.com
```

#### **Anyshift Enhancements**

```bash
# File Writing System
export WRITE_TO_FILE="true"              # Enable response file writing
export OUTPUT_DIR="/path/to/output"      # Directory for output files

# Timestamp Adjustment (for evaluation scenarios)
export DATADOG_EVAL_TIMESTAMP="2024-01-15T10:30:00Z"  # Limit data to before this time
```

## Installation

### Via npm

```bash
npm install @anyshift/datadog-mcp-server
```

### Development Setup

```bash
git clone https://github.com/anyshift-engineering/mcp-server-datadog.git
cd mcp-server-datadog
pnpm install
pnpm build
pnpm watch   # for development with auto-rebuild
```

## Usage with Claude Desktop

Add the following to your `claude_desktop_config.json`:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

### Using the built package:

```json
{
  "mcpServers": {
    "anyshift-datadog": {
      "command": "npx",
      "args": ["-y", "@anyshift/datadog-mcp-server"],
      "env": {
        "DATADOG_API_KEY": "<YOUR_API_KEY>",
        "DATADOG_APP_KEY": "<YOUR_APP_KEY>",
        "DATADOG_SITE": "<YOUR_SITE>",
        "WRITE_TO_FILE": "true",
        "OUTPUT_DIR": "/tmp/datadog-mcp-output"
      }
    }
  }
}
```

### Using local development build:

```json
{
  "mcpServers": {
    "anyshift-datadog": {
      "command": "/path/to/mcp-server-datadog/build/index.js",
      "env": {
        "DATADOG_API_KEY": "<YOUR_API_KEY>",
        "DATADOG_APP_KEY": "<YOUR_APP_KEY>",
        "DATADOG_SITE": "<YOUR_SITE>",
        "WRITE_TO_FILE": "true",
        "OUTPUT_DIR": "/tmp/datadog-mcp-output"
      }
    }
  }
}
```

## Development & Debugging

### MCP Inspector

Debug and test the server using the MCP Inspector:

```bash
# Build and run inspector
pnpm build
npm run inspector

# Or with local config
npm run inspect-local
```

The inspector provides a web interface to test tools and view logs.

### Testing

```bash
# Run tests
pnpm test

# Run with coverage
pnpm test:coverage

# Watch mode for development
pnpm test:watch
```

### Code Quality

```bash
# Lint and format code
pnpm lint
pnpm format

# Type checking (via build)
pnpm build
```

## File Writing System

When `WRITE_TO_FILE=true` and `OUTPUT_DIR` is set, responses are automatically saved with:

- **Compact Filenames**: `{timestamp}_{tool_abbrev}_{args_hash}.json`
- **Schema Analysis**: Automatic JSON schema generation for responses
- **Metadata**: File size, line count, and structural information
- **Security**: Sensitive data filtering in filenames

Example output:

```
Response written to file: /tmp/output/1758125608129_met_qry_a1b2c3.json
Size: 1024 characters
Lines: 42

JSON Schema:
{
  "type": "object",
  "properties": {
    "series": {"type": "array", "length": 5}
  }
}
```

## Contributing

This project is maintained by the Anyshift engineering team. We welcome contributions!

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run the test suite: `pnpm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to your branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Add tests for new functionality
- Update documentation for new features
- Ensure code passes linting and formatting checks

## Acknowledgments

This project is an enhanced fork of the excellent work by [@winor30](https://github.com/winor30) on [mcp-server-datadog](https://github.com/winor30/mcp-server-datadog). We're grateful for their foundational contribution to the MCP ecosystem.

## License

This project is licensed under the [Apache License, Version 2.0](./LICENSE).

---

**Maintained with ❤️ by [Anyshift](https://github.com/anyshift-engineering)**
