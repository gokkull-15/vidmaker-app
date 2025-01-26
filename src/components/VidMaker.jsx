import React, { useState, useRef } from "react";
import { CirclePicker } from "react-color";

const VideoMaker = () => {
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [numberOfVideos, setNumberOfVideos] = useState(1);
  const [contentTable, setContentTable] = useState(
    Array(10)
      .fill()
      .map(() => ({ title: "", content: "", duration: 60 }))
  );
  const [generatedVideos, setGeneratedVideos] = useState([]);
  const [textSpeed, setTextSpeed] = useState(5); // Words per second
  const fileInputRef = useRef(null);

  const ratioOptions = ["16:9", "9:16", "1:1", "4:3"];

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackgroundImage = () => {
    setBackgroundImage(null);
  };

  const updateContentTable = (rowIndex, field, value) => {
    const newTable = [...contentTable];
    newTable[rowIndex][field] = value;
    setContentTable(newTable);
  };

  const generateVideos = () => {
    const validVideos = contentTable
      .slice(0, numberOfVideos)
      .filter((row) => row.title && row.content);

    if (validVideos.length === numberOfVideos) {
      const videos = validVideos.map((row) => ({
        title: row.title,
        content: row.content,
        backgroundColor,
        backgroundImage,
        aspectRatio,
        duration: row.duration,
        textSpeed,
      }));

      setGeneratedVideos(videos);
    } else {
      alert("Please fill all titles and contents");
    }
  };

  const getPreviewDimensions = (ratio) => {
    const [width, height] = ratio.split(":").map(Number);
    return {
      aspectRatio: ratio,
      objectFit: "cover",
      width: `${(300 * width) / height}px`, // Dynamically adjust width based on aspect ratio
      height: "300px",
    };
  };

  const saveVideo = (video) => {
    const videoBlob = new Blob([JSON.stringify(video)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(videoBlob);
    link.download = `${video.title}_video.json`;
    link.click();
  };

  return (
    <div className="container p-4 mx-auto">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-2xl font-bold">Video Maker</h2>

        {/* Aspect Ratio Selection */}
        <div className="mb-4">
          <h3 className="mb-2 text-lg font-semibold">Select Ratio</h3>
          <div className="flex space-x-2">
            {ratioOptions.map((ratio) => (
              <button
                key={ratio}
                className={`px-4 py-2 border rounded ${
                  aspectRatio === ratio
                    ? "bg-blue-500 text-white"
                    : "bg-white text-black"
                }`}
                onClick={() => setAspectRatio(ratio)}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        {/* Background Selection */}
        <div className="mb-4">
          <h3 className="mb-2 text-lg font-semibold">Select Background</h3>
          <div className="flex items-center space-x-4">
            <CirclePicker
              color={backgroundColor}
              onChange={(color) => setBackgroundColor(color.hex)}
            />
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {backgroundImage && (
              <button
                onClick={removeBackgroundImage}
                className="px-4 py-2 text-white bg-red-500 rounded"
              >
                Remove Image
              </button>
            )}
          </div>
        </div>

        {/* Text Speed Selection */}
        <div className="mb-4">
          <h3 className="mb-2 text-lg font-semibold">
            Text Speed (words/second)
          </h3>
          <input
            type="range"
            min="1"
            max="10"
            value={textSpeed}
            onChange={(e) => setTextSpeed(Number(e.target.value))}
            className="w-full"
          />
          <span>{textSpeed} words/second</span>
        </div>

        {/* Number of Videos Selection */}
        <div className="mb-4">
          <h3 className="mb-2 text-lg font-semibold">Number of Videos</h3>
          <select
            value={numberOfVideos}
            onChange={(e) => setNumberOfVideos(Number(e.target.value))}
            className="w-full p-2 border rounded"
          >
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>

        {/* Content Table */}
        <div className="mb-4">
          <table className="w-full border">
            <thead>
              <tr>
                <th className="p-2 border">Title</th>
                <th className="p-2 border">Content</th>
                <th className="p-2 border">Duration (sec)</th>
              </tr>
            </thead>
            <tbody>
              {contentTable.slice(0, numberOfVideos).map((row, index) => (
                <tr key={index}>
                  <td className="p-2 border">
                    <input
                      type="text"
                      value={row.title}
                      onChange={(e) =>
                        updateContentTable(index, "title", e.target.value)
                      }
                      placeholder={`Title ${index + 1}`}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </td>
                  <td className="p-2 border">
                    <textarea
                      value={row.content}
                      onChange={(e) =>
                        updateContentTable(index, "content", e.target.value)
                      }
                      placeholder={`Content ${index + 1}`}
                      className="w-full p-2 border rounded"
                      rows={3}
                      required
                    />
                  </td>
                  <td className="p-2 border">
                    <input
                      type="number"
                      value={row.duration}
                      onChange={(e) =>
                        updateContentTable(
                          index,
                          "duration",
                          Number(e.target.value)
                        )
                      }
                      min="10"
                      max="120"
                      className="w-full p-2 border rounded"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateVideos}
          className="w-full py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Generate Videos
        </button>

        {/* Generated Videos Preview */}
        {generatedVideos.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 text-lg font-semibold">Generated Videos</h3>
            <div className="grid grid-cols-2 gap-4">
              {generatedVideos.map((video, index) => (
                <div
                  key={index}
                  className="p-4 border rounded"
                  style={{
                    ...getPreviewDimensions(video.aspectRatio),
                    backgroundColor: video.backgroundColor,
                    backgroundImage: video.backgroundImage
                      ? `url(${video.backgroundImage})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="p-2 mb-2 text-2xl font-bold text-white bg-black/50">
                    {video.title}
                  </div>
                  <div className="h-full p-2 overflow-auto text-xl text-white bg-black/50">
                    {video.content}
                  </div>
                  <div className="flex mt-2 space-x-2">
                    <button
                      onClick={() => saveVideo(video)}
                      className="w-full py-1 text-white bg-green-500 rounded"
                    >
                      Save Video
                    </button>
                    <button className="w-full py-1 text-white bg-blue-500 rounded">
                      Edit Video
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoMaker;
