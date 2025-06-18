import { toPng } from "html-to-image";
const SPREADSHEET_URL = "https://drive.google.com/uc?export=download&id=1bqe2sPoRfeCmsmvRL5M0Kfk2etzvwFI2";



export const handleCSVDownload = async (e) => {
  e.preventDefault();
  

  try {
    window.open(SPREADSHEET_URL, '_blank');
  } catch (error) {
    console.error("Error opening download link:", error);
  } finally {
  }
};

export const downloadImage = async (captureRef, childrenRef, buttonId,downloadName="image",lang="es") => {
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
  if (!captureRef) {
    // const element = document.getElementById("capture-area");
    captureArea.innerHTML = document.body.innerHTML;
    //   const element = document.body; // también podés probar con document.documentElement
    if (!captureArea) return;
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
    // Remove all elements with exclude-from-capture class
    const excludeElements = captureArea.querySelectorAll(".remove-from-capture");
    excludeElements.forEach((el) => el.remove());

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
        // OJO: puede fallar si hay muchos recursos externos (imágenes, iframes, fonts)
      });
    } catch (e) {
      document.getElementById("capture-area").innerHTML = "";
      showLoader.classList.add("hidden");
      arrow.classList.remove("hidden");
      return;
    }
  } else {
    captureArea.style.padding = "20px";
    const element = document.getElementById(captureRef);
    captureArea.style.width = `${element.offsetWidth}px`;
    captureArea.innerHTML = element.innerHTML;
    const excludeElements = element.querySelectorAll(".remove-from-capture");
    excludeElements.forEach((el) => el.remove());

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
  }

  const link = document.createElement("a");
  link.download = `${downloadName}.png` 
  link.href = dataUrl;
  link.click();
  // const captureArea = document.getElementById("capture-area");
  if(captureArea) captureArea.innerHTML = "";
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