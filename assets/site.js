(() => {
  document.documentElement.classList.add("js");
  const toggle = document.querySelector(".mobile-toggle");
  const nav = document.querySelector("#main-navigation");
  const mobile = matchMedia("(max-width: 1050px)");
  const setMenu = (open) => {
    toggle?.setAttribute("aria-expanded", String(open));
    nav?.classList.toggle("is-open", open);
    const label = toggle?.querySelector("[data-menu-label]");
    if (label) label.textContent = open ? "Close" : "Menu";
  };
  toggle?.addEventListener("click", () => {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });
  mobile.addEventListener("change", () => setMenu(false));
  nav?.addEventListener("click", (event) => {
    if (mobile.matches && event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    document.querySelectorAll(".nav-dropdown[open]").forEach((el) => {
      el.open = false;
    });
    if (toggle?.getAttribute("aria-expanded") === "true") {
      toggle.click();
      toggle.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".site-header")) setMenu(false);
    document.querySelectorAll(".nav-dropdown[open]").forEach((el) => {
      if (!el.contains(event.target)) el.open = false;
    });
  });
  document.querySelectorAll(".nav-dropdown").forEach((dropdown) => {
    dropdown.addEventListener("toggle", () => {
      if (dropdown.open)
        document.querySelectorAll(".nav-dropdown[open]").forEach((other) => {
          if (other !== dropdown) other.open = false;
        });
    });
  });
  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (href && !/^(?:[a-z]+:|\/\/|#)/i.test(href)) {
      link.setAttribute("href", href.replace(/index\.html(?=($|[?#]))/, ""));
    }
  });
  const blogUrl = "/blog/";
  if (nav && !nav.querySelector(`a[href="${blogUrl}"]`)) {
    const blogLink = document.createElement("a");
    blogLink.href = blogUrl;
    blogLink.textContent = "Blog";
    nav.append(blogLink);
  }
  document.querySelector(".header-inner > .button")?.remove();
  const footerColumns = document.querySelectorAll(".footer-col");
  const footerBlogColumn = [...footerColumns].find((column) =>
    /Perwira Visa/i.test(column.querySelector("strong")?.textContent),
  );
  if (
    footerBlogColumn &&
    !footerBlogColumn.querySelector(`a[href="${blogUrl}"]`)
  ) {
    const blogLink = document.createElement("a");
    blogLink.href = blogUrl;
    blogLink.innerHTML =
      '<svg class="icon nav-icon" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>Blog';
    footerBlogColumn.append(blogLink);
  }
  const translatorMedia = matchMedia("(max-width: 1050px)");
  const translatorSettings = (isMobile) => ({
    default_language: "en",
    detect_browser_language: true,
    languages: ["en", "fr", "it", "es", "ru", "id"],
    wrapper_selector: ".gtranslate_wrapper",
    switcher_horizontal_position: "right",
    ...(isMobile ? {} : { switcher_vertical_position: "top" }),
    float_switcher_open_direction: "bottom",
  });
  const mountTranslator = () => {
    document.querySelector(".gtranslate_wrapper")?.remove();
    document.querySelector("#gt_float_wrapper")?.remove();
    document.querySelector(".gtranslate_css")?.remove();
    const wrapper = document.createElement("div");
    wrapper.className = "gtranslate_wrapper";
    document.body.append(wrapper);
    window.gtranslateSettings = translatorSettings(translatorMedia.matches);
    const translator = document.createElement("script");
    translator.src = "https://cdn.gtranslate.net/widgets/latest/float.js";
    translator.defer = true;
    document.body.append(translator);
  };
  mountTranslator();
  translatorMedia.addEventListener("change", mountTranslator);
  const compactToc = matchMedia("(max-width: 850px)");
  const setToc = () =>
    document.querySelectorAll(".toc-disclosure").forEach((el) => {
      el.open = !compactToc.matches;
    });
  setToc();
  compactToc.addEventListener("change", setToc);
  document.querySelectorAll(".toc nav a").forEach((link) =>
    link.addEventListener("click", () => {
      if (compactToc.matches) link.closest(".toc-disclosure").open = false;
    }),
  );
  const search = document.querySelector("#faq-search");
  let category = "all";
  const filterFaqs = () => {
    const query = (search?.value || "").trim().toLowerCase();
    let count = 0;
    document.querySelectorAll("[data-faq-item]").forEach((item) => {
      const matches =
        (category === "all" || item.dataset.category === category) &&
        item.textContent.toLowerCase().includes(query);
      item.hidden = !matches;
      if (matches) count += 1;
    });
    document.querySelectorAll(".faq-group").forEach((group) => {
      group.hidden = ![...group.querySelectorAll("[data-faq-item]")].some(
        (item) => !item.hidden,
      );
    });
    const output = document.querySelector("#faq-count");
    if (output)
      output.textContent = `${count} ${count === 1 ? "answer" : "answers"}${query ? " matching your search" : ""}`;
    const empty = document.querySelector("#faq-empty");
    if (empty) empty.hidden = count > 0;
  };
  search?.addEventListener("input", filterFaqs);
  document.querySelectorAll("[data-faq-filter]").forEach((button) =>
    button.addEventListener("click", () => {
      category = button.dataset.faqFilter;
      document
        .querySelectorAll("[data-faq-filter]")
        .forEach((el) =>
          el.setAttribute("aria-pressed", String(el === button)),
        );
      filterFaqs();
    }),
  );
  if (search) filterFaqs();
  document.querySelectorAll("[data-update-filter]").forEach((button) =>
    button.addEventListener("click", () => {
      const value = button.dataset.updateFilter;
      document
        .querySelectorAll("[data-update-filter]")
        .forEach((el) =>
          el.setAttribute("aria-pressed", String(el === button)),
        );
      document.querySelectorAll("[data-update-category]").forEach((item) => {
        item.hidden = value !== "all" && item.dataset.updateCategory !== value;
      });
    }),
  );
  const form = document.querySelector("#enquiry-form");
  if (form) {
    const service = form.elements.service;
    const updateFields = () => {
      document.querySelectorAll("[data-service-fields]").forEach((group) => {
        const show = group.dataset.serviceFields
          .split(",")
          .includes(service.value);
        group.hidden = !show;
        group.querySelectorAll("input,select,textarea").forEach((input) => {
          input.disabled = !show;
        });
      });
      document.querySelector("#enquiry-result").hidden = true;
    };
    const selected = new URLSearchParams(location.search).get("service");
    if (
      selected &&
      [...service.options].some((option) => option.value === selected)
    )
      service.value = selected;
    service.addEventListener("change", updateFields);
    updateFields();
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = form.elements.email;
      const phone = form.elements.phone;
      if (!email.value.trim() && !phone.value.trim()) {
        email.setCustomValidity(
          "Enter an email address or WhatsApp number so we can reply.",
        );
        email.reportValidity();
        email.focus();
        return;
      }
      email.setCustomValidity("");
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const enquiry = window.PerwiraEnquiry.prepare(
        form.dataset.whatsapp,
        service.options[service.selectedIndex].text,
        data,
      );
      document.querySelector("#enquiry-text").textContent = enquiry.message;
      document.querySelector("#open-whatsapp").href = enquiry.url;
      const result = document.querySelector("#enquiry-result");
      result.hidden = false;
      document.querySelector("#copy-status").textContent = "";
      result.scrollIntoView({
        behavior:
          matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : (
            "smooth"
          ),
        block: "center",
      });
      result.focus({ preventScroll: true });
      // Keep this synchronous with the visitor's submit gesture. The visible link
      // and copy option remain available if a browser blocks the new tab/app.
      window.open(enquiry.url, "_blank", "noopener,noreferrer");
    });
    form.addEventListener("input", () => {
      document.querySelector("#enquiry-result").hidden = true;
    });
    [form.elements.email, form.elements.phone].forEach((input) =>
      input.addEventListener("input", () =>
        form.elements.email.setCustomValidity(""),
      ),
    );
    document
      .querySelector("#copy-enquiry")
      .addEventListener("click", async () => {
        const text = document.querySelector("#enquiry-text").textContent;
        try {
          await navigator.clipboard.writeText(text);
          document.querySelector("#copy-status").textContent =
            "Copied. Paste your message into WhatsApp and tap Send.";
        } catch {
          const range = document.createRange();
          range.selectNodeContents(document.querySelector("#enquiry-text"));
          const selection = getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          document.querySelector("#copy-status").textContent =
            "Message selected. Press Ctrl+C or use Copy on your device.";
        }
      });
    document.querySelector("#prepare-enquiry").disabled = false;
  }
  if ("IntersectionObserver" in window) {
    const links = [...document.querySelectorAll(".toc nav a")];
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting)
            links.forEach((link) =>
              link.classList.toggle(
                "active",
                link.hash === `#${entry.target.id}`,
              ),
            );
        }),
      { rootMargin: "-15% 0px -60% 0px" },
    );
    document
      .querySelectorAll(".article-section[id]")
      .forEach((section) => observer.observe(section));
  }
})();
