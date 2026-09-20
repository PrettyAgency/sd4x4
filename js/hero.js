/* Picks the home hero before first paint (alternates each visit) and preloads it. */
(function () {
  var pick = 'storm';
  try {
    var last = localStorage.getItem('sd4x4-hero');
    pick = last === 'sunset' ? 'storm' : 'sunset';
    localStorage.setItem('sd4x4-hero', pick);
  } catch (e) {}
  document.documentElement.setAttribute('data-hero', pick);
  var l = document.createElement('link');
  l.rel = 'preload'; l.as = 'image'; l.fetchPriority = 'high';
  l.href = pick === 'sunset' ? 'img/hero/arb-mazda-bt50-sunset-warwick.webp' : 'img/hero/arb-toyota-hilux-storm-sky-southern-downs.webp';
  document.head.appendChild(l);
})();
