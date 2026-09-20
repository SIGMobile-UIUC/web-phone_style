import { expect, test } from "bun:test";
import { tba } from "../content/places";
import { appleMapsUrl, directionsUrl } from "./maps";

test("no directions while the place is TBA", () => {
  expect(directionsUrl(tba)).toBeNull();
  expect(appleMapsUrl(tba)).toBeNull();
});

test("directions use the place's own link when it has one, otherwise a search on name + address", () => {
  expect(directionsUrl({ name: "Hall", mapsUrl: "https://maps.example/hall" })).toBe("https://maps.example/hall");
  expect(directionsUrl({ name: "Example Hall", address: "123 Main St, Urbana, IL" })).toBe(
    "https://www.google.com/maps/search/?api=1&query=Example%20Hall%2C%20123%20Main%20St%2C%20Urbana%2C%20IL",
  );
  expect(appleMapsUrl({ name: "Example Hall" })).toBe("https://maps.apple.com/?q=Example%20Hall");
});
