let coordinates = [lon, lat]
const map = tt.map({
    key : mapToken,
    container: "map",
    center : coordinates,
    zoom : 9,
});

const marker = new tt.Marker({color : "red"})
.setLngLat(coordinates)
.setPopup(
    new tt.Popup().setHTML(
        `<h4>${listingTitle}</h4><p>Exact Location will be provided after booking</p>`
    )
)
.addTo(map);
