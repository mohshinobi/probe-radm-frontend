# Rule Set Generator - Code Architecture

## Overview
The code has been reorganized following the **Separation of Concerns** principle. Each file now has a single, well-defined responsibility.

## File Structure

### 📁 `rule-set-generator.types.ts`
**Purpose**: Type definitions and interfaces
- `Option`: Represents a selectable option with label, value, and optional color
- `Category`: Represents a category containing multiple options
- `RuleSelectionPayload`: API payload structure
- `ValidationResult`: Validation response structure

### 📁 `rule-set-generator.service.ts`
**Purpose**: HTTP operations and data transformation
**Responsibilities**:
- Fetch rule sets from API endpoints
- Transform API responses to Category format
- Send count/generate requests to API
- Utility methods for data transformation

### 📁 `rule-selection-state.service.ts`
**Purpose**: State management for chip selections
**Responsibilities**:
- Manage selected options state using Angular signals
- Handle chip selection/deselection logic
- Apply color coding to selected chips
- Validate selections (ensure all categories have selections)
- Build API payloads from current selections

### 📁 `file-download.service.ts`
**Purpose**: File download utilities
**Responsibilities**:
- Download text content as files
- Handle browser download operations
- Manage blob creation and cleanup

### 📁 `rule-set-generator.component.ts`
**Purpose**: UI logic and user interactions
**Responsibilities**:
- Manage component state (loading, validation errors)
- Handle user interactions (chip clicks, button clicks)
- Coordinate between services
- Display validation messages

## Benefits of This Architecture

### ✅ **Single Responsibility Principle**
Each service has one clear purpose and doesn't mix concerns

### ✅ **Testability**
Services can be tested independently with focused unit tests

### ✅ **Maintainability**
Changes to one concern (e.g., file download) don't affect others

### ✅ **Reusability**
Services like `FileDownloadService` can be reused across the application

### ✅ **Dependency Injection**
Clear service dependencies make the code more modular

## Service Dependencies
```
Component
├── RuleSetGeneratorService (HTTP operations)
├── RuleSelectionStateService (state management)
└── FileDownloadService (file operations)
```

## Data Flow
1. **Component** loads data via **RuleSetGeneratorService**
2. **User clicks** → **Component** → **RuleSelectionStateService**
3. **Validation** → **RuleSelectionStateService** → **Component**
4. **Generate/Count** → **Component** → **RuleSetGeneratorService**
5. **File download** → **Component** → **FileDownloadService**
