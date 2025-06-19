import { toPng } from "html-to-image";
import Papa from "papaparse";
const SPREADSHEET_URL =
  "https://drive.google.com/uc?export=download&id=1bqe2sPoRfeCmsmvRL5M0Kfk2etzvwFI2";

export const handleCSVDownload = async (e) => {
  e.preventDefault();

  try {
    window.open(SPREADSHEET_URL, "_blank");
  } catch (error) {
    console.error("Error opening download link:", error);
  } finally {
  }
};

export const downloadImage = async (
  captureRef,
  childrenRef,
  buttonId,
  downloadName = "image",
  lang = "es"
) => {
  let dataUrl;
  const filter = (node) => {
    const exclusionClasses = ["exclude-from-capture"];
    return !exclusionClasses.some((classname) =>
      node.classList?.contains(classname)
    );
  };

  const button = document.getElementById(buttonId);
  const showLoader = button.querySelector(`#capture-loader`);
  const arrow = document.getElementsByClassName("capture-arrow")[0];
  arrow?.classList.add("hidden");
  showLoader?.classList.remove("hidden");
  const captureArea = document.getElementById("capture-area");
  captureArea.style.fontFamily = "Inter, sans-serif";

  // Function to set Raleway font for all SVG text elements
  const setSVGFontFamily = (container) => {
    const svgTextElements = container.querySelectorAll("svg text, svg tspan");
    svgTextElements.forEach((textElement) => {
      textElement.style.fontFamily = "Raleway, sans-serif";
    });
  };

  // Function to convert SVG images to base64 for Chrome compatibility
  const convertSVGImagesToBase64 = async (container) => {
    const svgImages = container.querySelectorAll("svg image, svg image[href]");

    for (const img of svgImages) {
      const href = img.getAttribute("xlink:href") || img.getAttribute("href");
      if (href && href.startsWith("/")) {
        try {
          const response = await fetch(href);
          const blob = await response.blob();
          const reader = new FileReader();

          await new Promise((resolve, reject) => {
            reader.onload = () => {
              img.setAttribute("xlink:href", reader.result);
              img.setAttribute("href", reader.result);
              resolve();
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.warn("Failed to convert SVG image to base64:", href, error);
        }
      }
    }
  };

  captureArea.style.padding = "20px";
  const element = document.getElementById(captureRef);
  captureArea.style.width = `${element.offsetWidth}px`;
  captureArea.innerHTML = element.innerHTML;
  const excludeElements = captureArea.querySelectorAll(".remove-from-capture");
  excludeElements.forEach((el) => el.remove());
  if (childrenRef) {
    childrenRef.forEach((child) => {
      if (child.type === "map") {
        const mapImageUrl = child.image;
        const mapContainer = captureArea.querySelector(`#${child.container}`);
        if (mapContainer) {
          // Remove the SVG element
          const mapbox = mapContainer.querySelector(".mapboxgl-map");
          if (mapbox) {
            mapbox.remove();
          }

          const img = document.createElement("img");
          img.src = mapImageUrl;
          img.style.width = "100%";
          img.style.height = "100%";
          img.style.objectFit = "contain";
          mapContainer.appendChild(img);
        }
      }
    });
  }

  // Add logo at the top of captureArea
  const logoContainer = document.createElement("div");
  logoContainer.style.textAlign = "center";
  logoContainer.style.padding = "20px";
  logoContainer.style.backgroundColor = "#ffffff";

  const logo = document.createElement("img");
  logo.src = `/logo_${lang}.png`;
  logo.style.width = "200px";
  logo.style.height = "auto";

  // Wait for logo to load before capturing
  await new Promise((resolve) => {
    logo.onload = resolve;
    logoContainer.appendChild(logo);
    captureArea.insertBefore(logoContainer, captureArea.firstChild);
  });

  // Set Raleway font for all SVG text elements
  setSVGFontFamily(captureArea);

  // Convert SVG images to base64 for Chrome compatibility
  await convertSVGImagesToBase64(captureArea);

  dataUrl = await toPng(captureArea, {
    skipFonts: true,
    cacheBust: true,
    backgroundColor: "#ffffff",
    style: {
      transform: "scale(1)",
      transformOrigin: "top left",
    },
    filter: filter,
  });

  const link = document.createElement("a");
  link.download = `${downloadName}.png`;
  link.href = dataUrl;
  link.click();
  // const captureArea = document.getElementById("capture-area");
  if (captureArea) captureArea.innerHTML = "";
  showLoader?.classList.add("hidden");
  arrow?.classList.remove("hidden");
};

export const handleJSONDownload = async (value) => {
  try {
    const fileName =
      value === "regional" ? "nivel_1_low.json" : "nivel_2_3_low.gpkg";
    const response = await fetch(`/maps/${fileName}`);
    if (!response.ok) throw new Error("Download failed");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const downloadName =
      value === "regional" ? `nivel_1.json` : `nivel_2_3.gpkg`;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Error downloading file:", error);
  }
};

export const handleChartDataDownload = (
  chartDataFunction,
  fileName = "chart-data"
) => {
  const chartData = chartDataFunction();
  if (!chartData || !Array.isArray(chartData)) {
    console.error("No valid chart data provided");
    return;
  }

  const csv = Papa.unparse(chartData);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
