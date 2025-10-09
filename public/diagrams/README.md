# Multiflexmeter V3.7.0 Architecture Diagrams

This directory contains C4 architecture diagrams for the Multiflexmeter V3.7.0 project in two formats:

## Diagram Formats

### PlantUML (`.puml` files)
- Traditional format using PlantUML with C4 extensions
- Can be rendered using PlantUML tools
- Works with VS Code PlantUML extension

### LikeC4 (`.likec4` files)
- Modern DSL format for C4 diagrams
- Can be rendered using LikeC4 CLI or VS Code extension
- Supports multiple views and better relationship definitions

## Diagrams Available

### 1. System Context
- **Files:** `system_context.puml`, `system_context.likec4`
- **Description:** Shows the Multiflexmeter V3.7.0 in its ecosystem with external actors and systems
- **Includes:** Users, TTN network, integration platforms, programming tools

### 2. Container Context
- **Files:** `container_context.puml`, `container_context.likec4`
- **Description:** Shows the internal structure of the MFM device
- **Includes:** Firmware, LMIC library, EEPROM, sensor module, RFM95 radio

### 3. Component Context
- **Files:** `component_context.puml`, `component_context.likec4`
- **Description:** Shows the firmware component breakdown
- **Includes:** Main controller, event handlers, sensor interface, SMBus driver, configuration manager

### 4. Code Context
- **Files:** `code_context.puml`, `code_context.likec4`
- **Description:** Shows the execution flow and function call relationships
- **Includes:** Initialization sequence, job execution, event handling, sensor operations

## Rendering the Diagrams

### Using PlantUML

**Option 1: VS Code Extension**
1. Install "PlantUML" extension in VS Code
2. Open any `.puml` file
3. Press `Alt+D` to preview

**Option 2: Command Line**
```bash
# Install PlantUML
brew install plantuml  # macOS
# or download from https://plantuml.com/

# Render diagram
plantuml system_context.puml
```

**Option 3: Online**
- Visit https://www.plantuml.com/plantuml/
- Copy/paste diagram content

### Using LikeC4

**Option 1: VS Code Extension**
1. Install "LikeC4" extension in VS Code
2. Open any `.likec4` file
3. View in the LikeC4 panel

**Option 2: Command Line**
```bash
# Install LikeC4 CLI
npm install -g likec4

# Render diagram
likec4 preview system_context.likec4
```

**Option 3: Web**
- Visit https://likec4.dev/
- Use the online playground

## Diagram Structure

### PlantUML Structure
```plantuml
@startuml
!include C4_Context.puml

Person(user, "User", "Description")
System(system, "System", "Description")
Rel(user, system, "Uses", "Technology")

@enduml
```

### LikeC4 Structure
```likec4
specification {
  element person
  element system
}

model {
  user = person 'User' {
    description 'Description'
  }
  
  system = system 'System' {
    description 'Description'
  }
  
  user -> system 'Uses' {
    technology 'Technology'
  }
}

views {
  view index {
    title 'View Title'
    include *
  }
}
```

## Updating Diagrams

When making changes to the architecture:

1. Update **both** PlantUML and LikeC4 versions
2. Keep element names and relationships consistent
3. Test rendering in both formats
4. Update the architecture documentation (`src/content/docs/guides/architecture.md`)

## Exporting Diagrams

### Export as PNG/SVG (PlantUML)
```bash
plantuml -tsvg system_context.puml
plantuml -tpng system_context.puml
```

### Export as PNG/SVG (LikeC4)
```bash
likec4 export system_context.likec4 --format svg
likec4 export system_context.likec4 --format png
```

## Integration in Documentation

The diagrams are referenced in the documentation with links to both formats:

```markdown
**Diagrams:**
- [PlantUML Version](/diagrams/system_context.puml)
- [LikeC4 Version](/diagrams/system_context.likec4)
```

## Resources

- **C4 Model:** https://c4model.com/
- **PlantUML:** https://plantuml.com/
- **PlantUML C4:** https://github.com/plantuml-stdlib/C4-PlantUML
- **LikeC4:** https://likec4.dev/
- **LikeC4 GitHub:** https://github.com/likec4/likec4
