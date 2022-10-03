# grafana-quick-log-panel
Grafana Quick Log Panel Plugin

[![grafana-quicklog-panel plugin usage video](https://github.com/ui3o/grafana-quick-log-panel/raw/main/resources/quick-log-panel-preview.png)](https://www.youtube.com/watch?v=PJylDybkHWw "grafana-quicklog-panel plugin usage video")


## Options

### 1) Latest at bottom

Possible to see log line as natural log message like `tail -f ...`.

### 2) Multiline mode

If the field line has `\n` then a **multiline** button will be added, and the lines will be collected.

### 3) Custom css

Possible to add custom inline css to the panel. Each row has custom class name. To check your current class list, please inspect your DOM.

Example:

```css
.ql-name-message{flex-grow:1;max-width:54%;}.ql-data-multiitem-button{color:green !important;}
```

### 4) Value include list

Possible to add extra css for the values. Only need to type the filter text and separate the css with `||` double pipe. Syntax: `foo bar ||color:red;`. `foo bar ` is the search text, `color:red;` is the custom css. For the custom css do not need to use `{}` curly brackets.

Example:

```css
foo bar ||color:red;
```

### 5) Share

Possible to share current option to another quick-log panel on other dashboard.

### 6) Custom mapper

Possible to add custom field mapper. During the rendering on each field the custom mapper will be called.   

Example:

```js
(filed) => { 
   return filed.name + filed.val;
} 
```

### 7) Quick search

During the list browsing possible to quick filter the current list. Type the text. The search text and value lines are converted to lowerCase.  


## Getting started

1. Install dependencies

   ```bash
   yarn install
   ```

2. Build plugin in watch mode

   ```bash
   yarn watch
   ```

3. Build plugin in production mode

   ```bash
   yarn build
   ```
## Docker build

```shell
docker build --build-arg GRAFANA_API_KEY=${GRAFANA_API_KEY} .
```

## Learn more

- [Build a panel plugin tutorial](https://grafana.com/tutorials/build-a-panel-plugin)
- [Grafana documentation](https://grafana.com/docs/)
- [Grafana Tutorials](https://grafana.com/tutorials/) - Grafana Tutorials are step-by-step guides that help you make the most of Grafana
- [Grafana UI Library](https://developers.grafana.com/ui) - UI components to help you build interfaces using Grafana Design System

