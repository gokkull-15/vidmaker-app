import React, { useState } from "react";

const VideoMaker = () => {
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [tableData, setTableData] = useState(
    Array(10).fill({ title: "", content: "" })
  );

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setBackgroundImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleTableChange = (index, field, value) => {
    const updatedData = [...tableData];
    updatedData[index][field] = value;
    setTableData(updatedData);
  };

  const startGenerating = () => {
    tableData.forEach((row, index) => {
      if (row.title && row.content) {
        console.log(`Generating video ${index + 1}`);
        console.log(`Title: ${row.title}`);
        console.log(`Content: ${row.content}`);
      }
    });
  };

  return (
    <div className="container p-6 mx-auto">
      {/* Select Ratio */}
      <div className="mb-6">
        <h2 className="mb-2 text-xl font-bold">Select the Ratio</h2>
        <select
          className="w-48 p-2 border border-gray-300 rounded"
          value={aspectRatio}
          onChange={(e) => setAspectRatio(e.target.value)}
        >
          <option value="16:9">16:9 (Landscape)</option>
          <option value="9:16">9:16 (Portrait)</option>
        </select>
      </div>

      {/* Select Background */}
      <div className="mb-6">
        <h2 className="mb-2 text-xl font-bold">Select the Background</h2>
        <div className="flex items-center space-x-4">
          {["#ffffff", "#f87171", "#60a5fa", "#34d399", "#fbbf24"].map((color) => (
            <div
              key={color}
              className={`w-8 h-8 rounded-full cursor-pointer`}
              style={{ backgroundColor: color }}
              onClick={() => setBackgroundColor(color)}
            ></div>
          ))}
        </div>
      </div>

      {/* Select Image */}
      <div className="mb-6">
        <h2 className="mb-2 text-xl font-bold">Select the Image</h2>
        <input
          type="file"
          accept="image/*"
          className="p-2 border"
          onChange={handleFileChange}
        />
      </div>

      {/* Content Display Table */}
      <div className="mb-6">
        <h2 className="mb-2 text-xl font-bold">Content Display Table</h2>
        <table className="w-full border border-collapse border-gray-300">
          <thead>
            <tr>
              <th className="p-2 border border-gray-300">Title</th>
              <th className="p-2 border border-gray-300">Content</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index}>
                <td className="border border-gray-300">
                  <input
                    type="text"
                    className="w-full p-2"
                    value={row.title}
                    onChange={(e) =>
                      handleTableChange(index, "title", e.target.value)
                    }
                  />
                </td>
                <td className="border border-gray-300">
                  <input
                    type="text"
                    className="w-full p-2"
                    value={row.content}
                    onChange={(e) =>
                      handleTableChange(index, "content", e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Placements */}
      <div className="mb-6">
        <h2 className="mb-2 text-xl font-bold">Placements</h2>
        <div
          className={`relative overflow-hidden ${
            aspectRatio === "16:9" ? "w-96 h-54" : "w-48 h-96"
          }`}
          style={{
            backgroundColor,
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
          }}
        >
          <div className="absolute p-2 bg-white rounded shadow top-4 left-4">
            Title Box
          </div>
          <div className="absolute p-2 bg-white rounded shadow bottom-4 left-4">
            Content Box
          </div>
        </div>
      </div>

      {/* Start Generating */}
      <div>
        <button
          className="px-4 py-2 text-white bg-blue-500 rounded"
          onClick={startGenerating}
        >
          Start Generating
        </button>
      </div>
    </div>
  );
};

export default VideoMaker;
