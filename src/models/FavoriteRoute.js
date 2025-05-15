// A simple model to represent a saved route
class FavoriteRoute {
  constructor(id, name, city, algorithm, startPoint, endPoint, waypoints, timestamp) {
    this.id = id || Date.now().toString();
    this.name = name;
    this.city = city;
    this.algorithm = algorithm;
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.waypoints = waypoints || [];
    this.timestamp = timestamp || new Date().toISOString();
  }
  
  static fromJSON(json) {
    return new FavoriteRoute(
      json.id,
      json.name,
      json.city,
      json.algorithm,
      json.startPoint,
      json.endPoint,
      json.waypoints,
      json.timestamp
    );
  }
  
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      city: this.city,
      algorithm: this.algorithm,
      startPoint: this.startPoint,
      endPoint: this.endPoint,
      waypoints: this.waypoints,
      timestamp: this.timestamp
    };
  }
}

export default FavoriteRoute; 