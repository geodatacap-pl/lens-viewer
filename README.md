### README.md

# Face and Person Detection Client Application

This client application is designed to display detections from face and person detection algorithms. The project is structured using TypeScript and includes several components for different functionalities such as timelines, heatmaps, and common utilities.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Components](#components)
- [Contributing](#contributing)
- [License](#license)

## Installation

To install and run the application locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the application:**
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000` to see the application in action.

## Usage

This application interfaces with face and person detection algorithms and displays their detections in a user-friendly manner. The main features include:

- **Timeline:** Visual representation of detections over time.
- **Heatmap:** Spatial visualization of detection data.

## Project Structure

The project has the following structure:

```
/src
  /components
    - api.ts
    - common.ts
    - heatmap.ts
    - timeline.ts
  - main.ts
  - style.css
  - vite-env.d.ts
index.html
```

### Key Files:

- **index.html:** The main HTML file that serves as the entry point for the application.
- **main.ts:** The main TypeScript file that initializes and configures the application.
- **style.css:** The CSS file for styling the application.
- **vite-env.d.ts:** TypeScript environment declaration file.

## Components

### api.ts
Handles API calls to the backend for fetching detection data.

### common.ts
Contains common utilities and helper functions used throughout the application.

### heatmap.ts
Component responsible for generating and displaying the heatmap of detections.

### timeline.ts
Component responsible for generating and displaying the timeline of detections.

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch: `git checkout -b my-feature-branch`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin my-feature-branch`
5. Open a pull request.

Please ensure your code follows the project's coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
