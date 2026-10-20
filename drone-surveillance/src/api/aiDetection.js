const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export async function analyzeImage({ file, lat, long, timestamp, droneId }) {
  const formData = new FormData();
  formData.append('image', file, 'frame.jpg');
  formData.append('lat', lat);
  formData.append('lng', long);
  formData.append('timestamp', timestamp);
  if (droneId) formData.append('droneId', droneId);

  const response = await fetch(`${API_BASE_URL}/api/detect`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('AI analysis failed');
  const result = await response.json();
  // Map COCO classes to military asset types
  const classMap = {
    person: 'soldier',
    airplane: 'aircraft',
    truck: 'military vehicle',
    car: 'military vehicle',
  };
  // The inference service returns { class_name, confidence, bbox: [x1, y1, x2, y2], threat_level }
  const detected_objects = (result.detections || []).map(obj => {
    const [x1, y1, x2, y2] = obj.bbox || [0, 0, 0, 0];
    return {
      type: classMap[obj.class_name] || obj.class_name,
      confidence: obj.confidence,
      bounding_box: [x1, y1, x2 - x1, y2 - y1],
      threat_level: obj.threat_level === 'high' ? 'High' : obj.threat_level === 'medium' ? 'Medium' : 'Low',
    };
  });
  return { detected_objects };
}

export async function describeImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch(`${API_BASE_URL}/api/describe`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Description failed');
  return await response.json();
}
