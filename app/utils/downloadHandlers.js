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

  // Function to wait for all images to load
  const waitForImages = async (container) => {
    const images = container.querySelectorAll("img");

    const promises = Array.from(images).map((img, index) => {
      if (img.complete) {
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          console.warn(
            `Timeout en imagen ${index + 1}:`,
            img.src || img.getAttribute("src")
          );
          reject(new Error(`Image load timeout for image ${index + 1}`));
        }, 10000);

        img.onload = () => {
          clearTimeout(timeoutId);
          resolve();
        };

        img.onerror = (error) => {
          console.warn(
            `Error cargando imagen ${index + 1}:`,
            img.src || img.getAttribute("src"),
            error
          );
          clearTimeout(timeoutId);
          // En lugar de rechazar, resolvemos para continuar con las otras imágenes
          resolve();
        };
      });
    });

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error("Error en waitForImages:", error);
      // Continuar incluso si hay errores
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
        if (mapImageUrl) {
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
  // Wait for all images to load
  await waitForImages(captureArea);

  // Add footer element below all content
  const footerElement = document.querySelector(".footer");

  const footerClone = footerElement.cloneNode(true);

  footerClone.style.marginTop = "40px";
  captureArea.appendChild(footerClone);

  // Add a small delay to ensure Chrome has fully rendered everything
  await new Promise((resolve) => setTimeout(resolve, 200));

  try {
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
  } catch (error) {
    console.error("Error generating PNG image:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      captureArea: captureArea ? "exists" : "missing",
      captureAreaChildren: captureArea ? captureArea.children.length : 0,
    });
    throw error; // Re-throw to maintain the original error handling flow
  }

  const link = document.createElement("a");
  link.download = `${downloadName}.png`;
  link.href = dataUrl;
  link.click();
  // const captureArea = document.getElementById("capture-area");
  if (captureArea) captureArea.innerHTML = "";
  showLoader?.classList.add("hidden");
  arrow?.classList.remove("hidden");
};

export const handleShapesDownload = async (shapeType, lang = "es") => {
  try {
    let fileName;
    let downloadName;

    switch (shapeType) {
      case "regional":
        fileName = "nivel_1_low.json";
        downloadName = "nivel_1.json";
        break;
      case "local":
        fileName = "nivel_2_3_low.gpkg";
        downloadName = "nivel_2_3.gpkg";
        break;
      default:
        throw new Error("Invalid shape type");
    }

    const response = await fetch(`/maps/${fileName}`);
    if (!response.ok) throw new Error("Download failed");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Error downloading shapes file:", error);
  }
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
  // Agregar BOM para compatibilidad con Excel
  const csvWithBom = '\uFEFF' + csv;
  const blob = new Blob([csvWithBom], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
