(() => {
  const pages = {
    "sobre.html": { title: "Sobre | Robson Costa", sections: ["sobre"] },
    "projetos.html": { title: "Projetos | Robson Costa", sections: ["projetos"] },
    "habilidades.html": { title: "Habilidades | Robson Costa", sections: ["habilidades", "competencias"] },
    "experiencia.html": { title: "Experiência | Robson Costa", sections: ["experiencia"] },
    "contato.html": { title: "Contato | Robson Costa", sections: ["contato"] }
  };
  const file = location.pathname.split("/").pop() || "sobre.html";
  const page = pages[file];
  const root = document.querySelector("main");
  if (!page || !root) return;
  fetch("./index.html", { cache: "no-cache" })
    .then(response => {
      if (!response.ok) throw new Error("Não foi possível carregar o conteúdo.");
      return response.text();
    })
    .then(markup => {
      const source = new DOMParser().parseFromString(markup, "text/html");
      const style = source.querySelector("style");
      if (style) document.head.append(style.cloneNode(true));
      const header = source.querySelector("header");
      if (header) {
        const clonedHeader = header.cloneNode(true);
        clonedHeader.querySelectorAll("a").forEach(link => link.removeAttribute("aria-current"));
        clonedHeader.querySelectorAll(".links a").forEach(link => {
          if (link.getAttribute("href") === file) link.setAttribute("aria-current", "page");
        });
        document.body.prepend(clonedHeader);
      }
      const selected = page.sections
        .map(id => source.querySelector("#" + id))
        .filter(Boolean)
        .map(section => section.cloneNode(true));
      if (!selected.length) throw new Error("A seção desta página não foi encontrada.");
      selected.forEach(section => root.append(section));
      const footer = source.querySelector("footer");
      if (footer) document.body.append(footer.cloneNode(true));
      document.title = page.title;
      document.body.classList.add("portfolio-subpage");
    })
    .catch(() => {
      root.innerHTML = '<section class="wrap"><h1>Não foi possível abrir esta página</h1><p>Atualize o navegador para tentar novamente.</p><a href="index.html">Voltar ao início</a></section>';
    });
})();