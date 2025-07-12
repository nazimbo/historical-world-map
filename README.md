# Historical Interactive World Map

An interactive web application that allows users to explore the changing political borders of nations and empires throughout history using a comprehensive time-selection slider spanning over 125,000 years.

## Features

- **Interactive World Map**: Pan and zoom through historical territories
- **Comprehensive Timeline**: Navigate through 52 historical periods (123,000 BC to 2010 AD)
- **Territory Information**: Click on any territory to view details
- **Smooth Transitions**: Visual transitions between time periods
- **Responsive Design**: Works on desktop and mobile devices
- **Educational Focus**: Clear data attribution and historical context
- **Prehistoric to Modern**: Complete timeline from Ice Age to contemporary era

## Quick Start

1. **Clone or download** this repository
2. **Add GeoJSON data files** to the `data/` directory (see Data Setup below)
3. **Open `index.html`** in a web browser
4. **Explore history** using the time slider!

## Data Setup

This application utilizes comprehensive historical GeoJSON data files from the [Historical Basemaps](https://github.com/aourednik/historical-basemaps) repository, covering 52 time periods from 123,000 BC to 2010 AD.

### Complete Data Files Available

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

### Getting the Data

The application is configured to use all 52 available historical periods from the Historical Basemaps dataset. All files listed above are already available in your `/data` directory and configured in the application.

## Project Structure

```
historical-world-map/
├── index.html          # Main application page
├── app.js             # Core application logic
├── styles.css         # Styling and layout
├── README.md          # This file
└── data/              # Historical GeoJSON data (52 files)
    ├── world_bc123000.geojson # 123,000 BC - Prehistoric
    ├── world_bc10000.geojson  # 10,000 BC - End of Ice Age
    ├── world_bc8000.geojson   # 8,000 BC - Neolithic
    ├── world_bc5000.geojson   # 5,000 BC - Bronze Age
    ├── world_bc4000.geojson   # 4,000 BC - Early civilizations
    ├── world_bc3000.geojson   # 3,000 BC - Ancient Egypt
    ├── world_bc2000.geojson   # 2,000 BC - Middle Bronze Age
    ├── world_bc1500.geojson   # 1,500 BC - Late Bronze Age
    ├── world_bc1000.geojson   # 1,000 BC - Iron Age
    ├── world_bc700.geojson    # 700 BC - Archaic period
    ├── world_bc500.geojson    # 500 BC - Classical Antiquity
    ├── world_bc400.geojson    # 400 BC - Greek Golden Age
    ├── world_bc323.geojson    # 323 BC - Death of Alexander
    ├── world_bc300.geojson    # 300 BC - Hellenistic
    ├── world_bc200.geojson    # 200 BC - Roman expansion
    ├── world_bc100.geojson    # 100 BC - Late Republic
    ├── world_bc1.geojson      # 1 BC - End of BC era
    ├── world_100.geojson      # 100 AD - Roman Empire peak
    ├── world_200.geojson      # 200 AD - Pax Romana
    ├── world_300.geojson      # 300 AD - Late Roman Empire
    ├── world_400.geojson      # 400 AD - Fall of Rome
    ├── world_500.geojson      # 500 AD - Late antiquity
    ├── world_600.geojson      # 600 AD - Early Medieval
    ├── world_700.geojson      # 700 AD - Islamic expansion
    ├── world_800.geojson      # 800 AD - Charlemagne
    ├── world_900.geojson      # 900 AD - Viking Age
    ├── world_1000.geojson     # 1,000 AD - Medieval
    ├── world_1100.geojson     # 1,100 AD - Crusades
    ├── world_1200.geojson     # 1,200 AD - High Middle Ages
    ├── world_1279.geojson     # 1,279 AD - Mongol Empire
    ├── world_1300.geojson     # 1,300 AD - Late Medieval
    ├── world_1400.geojson     # 1,400 AD - Renaissance
    ├── world_1492.geojson     # 1,492 AD - Columbus
    ├── world_1500.geojson     # 1,500 AD - Age of Exploration
    ├── world_1530.geojson     # 1,530 AD - Early Renaissance
    ├── world_1600.geojson     # 1,600 AD - Colonial expansion
    ├── world_1650.geojson     # 1,650 AD - Post-Westphalia
    ├── world_1700.geojson     # 1,700 AD - Enlightenment
    ├── world_1715.geojson     # 1,715 AD - Spanish Succession
    ├── world_1783.geojson     # 1,783 AD - American Independence
    ├── world_1800.geojson     # 1,800 AD - Napoleonic era
    ├── world_1815.geojson     # 1,815 AD - Post-Napoleonic
    ├── world_1880.geojson     # 1,880 AD - Industrial Age
    ├── world_1900.geojson     # 1,900 AD - Imperial peak
    ├── world_1914.geojson     # 1,914 AD - WWI begins
    ├── world_1920.geojson     # 1,920 AD - Post-WWI
    ├── world_1930.geojson     # 1,930 AD - Great Depression
    ├── world_1938.geojson     # 1,938 AD - Pre-WWII
    ├── world_1945.geojson     # 1,945 AD - WWII ends
    ├── world_1960.geojson     # 1,960 AD - Cold War
    ├── world_1994.geojson     # 1,994 AD - Post-Cold War
    ├── world_2000.geojson     # 2,000 AD - Millennium
    └── world_2010.geojson     # 2,010 AD - Modern era
```

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Mapping**: Leaflet.js v1.9.4
- **Data Format**: GeoJSON
- **Hosting**: Any static web server (GitHub Pages, Netlify, etc.)

## Development

### Local Development

1. Start a local web server (required for loading GeoJSON files):
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (if you have it)
   npx serve .
   
   # PHP
   php -S localhost:8000
   ```

2. Open `http://localhost:8000` in your browser

### Adding New Time Periods

1. Add GeoJSON file to `data/` directory
2. Update the `periods` array in `app.js`:
   ```javascript
   { year: YOUR_YEAR, file: 'your_file.geojson', label: 'Your Label' }
   ```
3. Update the slider `max` value (currently 51 for 52 periods) and add labels in `index.html`

### Customizing Styling

- **Colors**: Edit CSS custom properties in `styles.css`
- **Map Style**: Modify `getFeatureStyle()` function in `app.js`
- **Layout**: Update CSS grid/flexbox properties

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

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: iOS Safari, Chrome Mobile
- **Requirements**: ES6 support, Fetch API, CSS Grid/Flexbox

## Performance Notes

- GeoJSON files are loaded on-demand for each time period
- Files should be < 3MB each for optimal performance
- Consider implementing caching for production use

## Known Limitations

- **Data Accuracy**: Simplified for world-scale display
- **Temporal Precision**: Discrete time points, not continuous timeline
- **Regional Detail**: Optimized for continental/world view
- **Modern Conflicts**: Disputed territories shown as de facto control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Future Enhancements

- [ ] Continuous timeline (not just discrete points)
- [ ] More detailed regional data
- [ ] Animation between time periods
- [ ] Additional data sources integration
- [ ] User preference persistence
- [ ] Export functionality
- [ ] Period bookmarking and favorites
- [ ] Historical event annotations
- [ ] Population and economic data overlays

## License

This project is open source. Please check individual data source licenses:
- Historical Basemaps: Check repository for specific licensing
- Leaflet.js: BSD 2-Clause License
- Application code: MIT License (modify as needed)

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify all data files are present and correctly named
3. Ensure you're running from a web server (not file://)
4. Check that your browser supports required features

## Acknowledgments

- **Euratlas-Nüssli** for historical basemap data
- **Leaflet.js** community for the excellent mapping library
- **OpenStreetMap** contributors for base map data
- Historical cartography research community

---

**Educational Use Disclaimer**: This application is designed for educational and exploratory purposes. Historical boundaries are approximations and should not be considered authoritative for academic research without additional verification.