import { toPng } from "html-to-image";

export const  downloadImage = async (captureRef) => {
    let dataUrl;
    const filter = (node) => {
      const exclusionClasses = ["exclude-from-capture"];
      return !exclusionClasses.some((classname) =>
        node.classList?.contains(classname)
      );
    };
    const showLoader=document.getElementById("capture-loader")
    const arrow=document.getElementsByClassName("capture-arrow")[0] 
    arrow?.classList.add("hidden")
    showLoader?.classList.remove("hidden")
    if (!captureRef) {
      const element = document.getElementById("capture-area");
      element.innerHTML = document.getElementById("main").innerHTML;
      //   const element = document.body; // también podés probar con document.documentElement
      if (!element) return;

      dataUrl = await toPng(element, {
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
    } else if (!captureRef.current) return;
    else {
      dataUrl = await toPng(captureRef.current, {
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
    link.download = "captura.png";
    link.href = dataUrl;
    link.click();
    document.getElementById("capture-area").innerHTML = "";
    showLoader.classList.add("hidden")
    arrow.classList.remove("hidden")
  };