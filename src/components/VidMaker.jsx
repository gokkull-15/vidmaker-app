import React, { useState, useRef } from "react";
import { CirclePicker } from "react-color";
import { FFmpeg } from "@ffmpeg/ffmpeg"; // Import FFmpeg directly

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

  const generateVideos = async () => {
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
      }));

      // Set the generated videos for display
      setGeneratedVideos(videos);

      // Generate MP4 video files for each valid video
      await generateMP4Videos(videos);
    } else {
      alert("Please fill all titles and contents");
    }
  };

  const generateMP4Videos = async (videos) => {
    const ffmpeg = new FFmpeg({ log: true });
    await ffmpeg.load(); // Load the FFmpeg wasm module

    for (const video of videos) {
      const {
        title,
        content,
        backgroundColor,
        backgroundImage,
        aspectRatio,
        duration,
      } = video;

      // Generate a background color or image
      const backgroundFile = backgroundImage
        ? `-i ${backgroundImage}` // Use image file
        : `-f lavfi -t ${duration} -i color=${backgroundColor}:s=640x480:r=30`; // Use color background

      // Convert text content into video using FFmpeg API
      const textOverlay = `${title}: ${content}`;

      const fileName = `${title}.mp4`;
      await ffmpeg.FS(
        "writeFile",
        "input.txt",
        new TextEncoder().encode(textOverlay)
      );

      // Example: generating video with text overlay
      await ffmpeg.run(
        backgroundFile,
        "-vf",
        `drawtext=textfile=input.txt:fontcolor=white:fontsize=24:x=(w-text_w)/2:y=(h-text_h)/2`,
        "-t",
        `${duration}`,
        "-s",
        aspectRatio, // Set aspect ratio
        fileName
      );

      // Retrieve the generated MP4 file
      const data = ffmpeg.FS("readFile", fileName);
      const videoBlob = new Blob([data.buffer], { type: "video/mp4" });
      const videoURL = URL.createObjectURL(videoBlob);

      // Save the video URL to the generatedVideos state
      setGeneratedVideos((prevVideos) => [
        ...prevVideos,
        { ...video, videoURL },
      ]);
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
                      required
                    />
                  </td>
                  <td className="p-2 border">
                    <input
                      type="number"
                      value={row.duration}
                      onChange={(e) =>
                        updateContentTable(index, "duration", e.target.value)
                      }
                      className="w-full p-2 border rounded"
                      required
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={generateVideos}
          className="px-4 py-2 text-white bg-blue-500 rounded"
        >
          Generate Videos
        </button>
      </div>

      {/* Preview */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold">Preview</h3>
        <div className="flex space-x-4">
          <div
            style={getPreviewDimensions(aspectRatio)}
            className="bg-gray-200"
          >
            Preview Box
          </div>
        </div>
      </div>

      {/* Generated Videos */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold">Generated Videos</h3>
        <div className="space-y-4">
          {generatedVideos.map((video, index) => (
            <div key={index} className="p-4 bg-gray-100 rounded shadow">
              <p className="font-semibold">{video.title}</p>
              <video
                width="320"
                height="240"
                controls
                src={video.videoURL} // Use the video URL here
              />
              <a
                href={video.videoURL}
                download={video.title + ".mp4"}
                className="inline-block mt-2 text-blue-600"
              >
                Download
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoMaker;