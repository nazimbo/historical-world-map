# Historical Interactive World Map

A modern, interactive web application that allows users to explore the changing political borders of nations and empires throughout history using a comprehensive time-selection slider spanning over 125,000 years.

## Features

- **Interactive World Map**: Pan and zoom through historical territories with smooth Leaflet.js integration
- **Comprehensive Timeline**: Navigate through 52 historical periods (123,000 BC to 2010 AD)
- **Territory Selection**: Click on any territory to view detailed information with persistent highlighting
- **Modern UI**: Glass-morphism design with backdrop blur effects and gradient backgrounds
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices with touch-friendly controls
- **Educational Focus**: Clear data attribution and historical context
- **Accessibility**: Keyboard navigation, screen reader support, and focus management
- **Error Handling**: Graceful handling of missing data files with retry options
- **Loading States**: Smooth loading indicators during data transitions
- **Debounced Navigation**: Optimized performance with debounced slider interactions

## Quick Start

1. **Clone or download** this repository
2. **Set up a local web server** (required for loading GeoJSON files)
3. **Open `index.html`** in a web browser
4. **Explore history** using the time slider!

## Data Setup

This application utilizes comprehensive historical GeoJSON data files from the [Historical Basemaps](https://github.com/aourednik/historical-basemaps) repository, covering 52 time periods from 123,000 BC to 2010 AD.

### Complete Data Files Included

The app now includes all 52 historical periods:

**Prehistoric Era (17 periods):**
- `world_bc123000.geojson` (123,000 BC) - Prehistoric humans
- `world_bc10000.geojson` (10,000 BC) - End of Ice Age
- `world_bc8000.geojson` (8,000 BC) - Neolithic Revolution
- `world_bc5000.geojson` (5,000 BC) - Bronze Age beginnings
- `world_bc4000.geojson` (4,000 BC) - Early civilizations
- `world_bc3000.geojson` (3,000 BC) - Ancient Egypt/Mesopotamia
- `world_bc2000.geojson` (2,000 BC) - Middle Bronze Age
- `world_bc1500.geojson` (1,500 BC) - Late Bronze Age
- `world_bc1000.geojson` (1,000 BC) - Iron Age
- `world_bc700.geojson` (700 BC) - Archaic period
- `world_bc500.geojson` (500 BC) - Classical Antiquity
- `world_bc400.geojson` (400 BC) - Greek Golden Age
- `world_bc323.geojson` (323 BC) - Death of Alexander
- `world_bc300.geojson` (300 BC) - Hellenistic period
- `world_bc200.geojson` (200 BC) - Roman expansion
- `world_bc100.geojson` (100 BC) - Late Roman Republic
- `world_bc1.geojson` (1 BC) - End of BC era

**Ancient & Medieval Era (16 periods):**
- `world_100.geojson` (100 AD) - Roman Empire peak
- `world_200.geojson` (200 AD) - Pax Romana
- `world_300.geojson` (300 AD) - Late Roman Empire
- `world_400.geojson` (400 AD) - Fall of Western Rome
- `world_500.geojson` (500 AD) - Late antiquity
- `world_600.geojson` (600 AD) - Early Medieval
- `world_700.geojson` (700 AD) - Islamic expansion
- `world_800.geojson` (800 AD) - Charlemagne era
- `world_900.geojson` (900 AD) - Viking Age
- `world_1000.geojson` (1,000 AD) - Medieval period
- `world_1100.geojson` (1,100 AD) - Crusades period
- `world_1200.geojson` (1,200 AD) - High Middle Ages
- `world_1279.geojson` (1,279 AD) - Mongol Empire peak
- `world_1300.geojson` (1,300 AD) - Late Medieval
- `world_1400.geojson` (1,400 AD) - Renaissance begins

**Modern Era (19 periods):**
- `world_1492.geojson` (1,492 AD) - Columbus voyage
- `world_1500.geojson` (1,500 AD) - Age of Exploration
- `world_1530.geojson` (1,530 AD) - Early Renaissance
- `world_1600.geojson` (1,600 AD) - Colonial expansion
- `world_1650.geojson` (1,650 AD) - Post-Westphalia
- `world_1700.geojson` (1,700 AD) - Enlightenment
- `world_1715.geojson` (1,715 AD) - Post-War of Spanish Succession
- `world_1783.geojson` (1,783 AD) - American Independence
- `world_1800.geojson` (1,800 AD) - Napoleonic era
- `world_1815.geojson` (1,815 AD) - Post-Napoleonic
- `world_1880.geojson` (1,880 AD) - Industrial Age
- `world_1900.geojson` (1,900 AD) - Imperial peak
- `world_1914.geojson` (1,914 AD) - WWI begins
- `world_1920.geojson` (1,920 AD) - Post-WWI
- `world_1930.geojson` (1,930 AD) - Great Depression
- `world_1938.geojson` (1,938 AD) - Pre-WWII
- `world_1945.geojson` (1,945 AD) - WWII ends
- `world_1960.geojson` (1,960 AD) - Cold War
- `world_1994.geojson` (1,994 AD) - Post-Cold War
- `world_2000.geojson` (2,000 AD) - Millennium
- `world_2010.geojson` (2,010 AD) - Modern era

### Data Attribution

The application utilizes all 52 available historical periods from the Historical Basemaps dataset. All files listed above are already included in your `/data` directory and configured in the application.

## Project Structure

```
historical-world-map/
├── index.html          # Main application page
├── app.js             # Main orchestrator class (refactored)
├── styles.css         # Styling with modern glass-morphism design
├── README.md          # This file
├── .gitignore         # Git ignore file
├── js/                # Modular JavaScript components
│   ├── DataManager.js     # Data caching and loading
│   ├── MapRenderer.js     # Leaflet map operations
│   ├── UIController.js    # User interface controls
│   ├── EventHandler.js    # Event coordination
│   └── ErrorNotification.js # Error handling
└── data/              # Historical GeoJSON data (52 files included)
    ├── world_bc123000.geojson # 123,000 BC - Prehistoric
    ├── world_bc10000.geojson  # 10,000 BC - End of Ice Age
    ├── ...                    # (all 52 files as listed above)
    └── world_2010.geojson     # 2,010 AD - Modern era
```

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+) with modular class-based architecture
- **Architecture**: Separation of concerns with dedicated modules for data, UI, events, and rendering
- **Mapping**: Leaflet.js v1.9.4 for interactive map rendering
- **Styling**: CSS3 with advanced features (backdrop-filter, CSS Grid, flexbox)
- **Data Format**: GeoJSON with comprehensive historical territory data
- **Caching**: Smart LRU cache with preloading for smooth navigation
- **Design**: Glass-morphism UI with responsive mobile-first design
- **Hosting**: Any static web server (GitHub Pages, Netlify, etc.)
- **Performance**: Debounced interactions, intelligent data caching, coordinate optimization
- **Accessibility**: ARIA labels, keyboard navigation, focus management

## Development

### Local Development

**Important:** You must serve the files from a web server (not open index.html directly) due to CORS restrictions when loading GeoJSON files.

```bash
# Python 3
python -m http.server 8000

# Node.js (if you have it)
npx serve .

# PHP
php -S localhost:8000

# VS Code Live Server extension
# Install the extension and right-click index.html → "Open with Live Server"
```

Then open `http://localhost:8000` in your browser.

### Controls

- **Slider**: Drag to navigate through time periods
- **Arrow Keys**: Navigate previous/next time periods
- **Click Map**: Select territories for detailed information
- **Escape Key**: Close territory information panel
- **Zoom**: Mouse wheel or zoom controls
- **Pan**: Click and drag map

### Architecture Overview

The application follows a modular architecture with clear separation of concerns:

- **DataManager**: Handles caching, loading, and GeoJSON optimization with LRU cache
- **MapRenderer**: Manages Leaflet map operations, styling, and layer management
- **UIController**: Controls sliders, panels, loading states, and user interface
- **EventHandler**: Coordinates user interactions and event delegation
- **ErrorNotification**: Centralized error handling with retry functionality
- **HistoricalMap**: Main orchestrator that coordinates all modules

### Adding New Time Periods

1. Add GeoJSON file to `data/` directory
2. Update the `periods` array in `app.js`:
   ```javascript
   { year: YOUR_YEAR, file: 'your_file.geojson', label: 'Your Label' }
   ```
3. Update the slider `max` value and add labels in `index.html`

## Data Sources & Attribution

- **Primary Data**: [Historical Basemaps](https://github.com/aourednik/historical-basemaps) by Euratlas-Nüssli
- **Base Map**: CartoDB Light (OpenStreetMap contributors)
- **Mapping Library**: Leaflet.js

### Important Notes

- Historical boundaries are approximations for educational purposes
- Pre-1648 borders represent cultural/political influence rather than modern territorial boundaries
- Data represents de facto control rather than all competing claims
- Always verify historical information with multiple sources for academic work

## Browser Support

- **Desktop**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: iOS Safari, Chrome Mobile with touch optimization
- **Requirements**: ES6 support, Fetch API, CSS Grid/Flexbox
- **Progressive Enhancement**: Fallbacks for older browsers without backdrop-filter

## Accessibility Features

- **Keyboard Navigation**: Arrow keys for time navigation, Escape to close panels
- **Screen Reader Support**: ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators and logical tab order
- **High Contrast**: Visible focus indicators and sufficient color contrast
- **Touch Friendly**: Large touch targets on mobile devices

## Error Handling

The application includes comprehensive error handling:

- **Missing Files**: Clear error messages with retry options
- **Network Issues**: Graceful degradation and user feedback
- **Invalid Data**: Validation of GeoJSON structure
- **Browser Compatibility**: Fallbacks for unsupported features

## Performance Optimizations

- **Smart Caching**: LRU cache with configurable size limits (default: 15 periods)
- **Preloading**: Adjacent time periods are preloaded in background for smooth navigation
- **Data Optimization**: Coordinate precision reduction for large files (>500KB)
- **Debounced Interactions**: Slider movements are debounced to prevent excessive requests
- **Memory Management**: Automatic cache eviction and proper layer cleanup
- **Responsive Design**: Mobile-first approach with optimized touch targets
- **Cache Monitoring**: Development mode shows cache hit rates and statistics

## Known Limitations

- **Data Accuracy**: Simplified for world-scale display
- **File Size**: Large data files may impact initial loading performance
- **Browser Support**: Advanced visual effects require modern browsers
- **Temporal Precision**: Discrete time points, not continuous timeline
- **Regional Detail**: Optimized for continental/world view rather than local detail
- **Modern Conflicts**: Disputed territories shown as de facto control

## Troubleshooting

### Common Issues

1. **Map not loading**
   - Check browser console for JavaScript errors
   - Ensure you have an internet connection for the base map tiles
   - Verify Leaflet.js is loading correctly from the CDN
   - Make sure you're running from a web server, not opening the file directly

2. **Slow loading**
   - Large GeoJSON files may take time to load initially
   - Check your internet connection
   - Clear browser cache if experiencing persistent issues

3. **Mobile performance issues**
   - Reduce visual effects if experiencing lag on older devices
   - Check that touch events are working properly
   - Ensure sufficient memory available on mobile device

4. **Slider not responding**
   - Ensure JavaScript is enabled in your browser
   - Check for any JavaScript console errors
   - Verify you're using a modern browser with ES6 support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Test thoroughly with various data files
4. Ensure accessibility standards are maintained
5. Submit a pull request

## Current Features

### ✅ Implemented
- **Modular Architecture**: Clean separation of concerns with dedicated modules
- **Smart Caching System**: LRU cache with preloading and optimization
- **Complete 52-period timeline support**
- **Territory selection with persistent highlighting**
- **Modern glass-morphism UI design**
- **Responsive mobile-first design**
- **Keyboard navigation and accessibility**
- **Advanced error handling with retry functionality**
- **Loading states and user feedback**
- **Performance optimizations and cache monitoring**
- **Debounced interactions and smooth navigation**

### 🔄 Future Enhancements
- [ ] Continuous timeline animation between periods
- [ ] Historical event annotations and markers
- [ ] Population and economic data overlays
- [ ] Search functionality for territories and time periods
- [ ] Comparison mode between different periods
- [ ] Export functionality for maps and data
- [ ] Offline support with cached data
- [ ] Custom time period creation
- [ ] Advanced filtering options

## License

This project is open source. Please check individual data source licenses:
- Historical Basemaps: Check repository for specific licensing
- Leaflet.js: BSD 2-Clause License
- Application code: MIT License

## Support

For issues or questions:

1. **Loading Issues**: Ensure you're running from a web server (not file://)
2. **JavaScript Errors**: Check the browser console for detailed error messages  
3. **Performance**: Try reducing visual effects or clearing browser cache
4. **Mobile Problems**: Check that touch events are supported
5. **Browser Compatibility**: Ensure you're using a modern browser with ES6 support

## Acknowledgments

- **Euratlas-Nüssli** for historical basemap data
- **Leaflet.js** community for the excellent mapping library
- **OpenStreetMap** contributors for base map data
- Historical cartography research community

---

**Educational Use Disclaimer**: This application is designed for educational and exploratory purposes. Historical boundaries are approximations and should not be considered authoritative for academic research without additional verification.