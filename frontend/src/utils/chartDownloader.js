// Utility to download charts as images
export const downloadChart = async (elementId, fileName = "chart") => {
  try {
    // Dynamically import html2canvas
    const html2canvas = (await import("html2canvas")).default;
    
    const element = document.getElementById(elementId);
    if (!element) {
      console.error("Chart element not found");
      return;
    }

    // Capture the chart as a canvas
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2, // Higher quality
    });

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  } catch (error) {
    console.error("Failed to download chart:", error);
    alert("Failed to download chart. Please try again.");
  }
};
