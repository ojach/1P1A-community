(() => {
  const isExcluded = document.querySelector(
    'meta[name="ojapp:exclude"][content="true"]'
  );

  if (isExcluded) {
    console.log("OJapp excluded on this page");
    return;
  }

  const DEFAULT_ICON =
    "https://ojapp.app/icon/icon-512.png";

  const NOTICE_STORAGE_KEY =
    "ojapp_notice_last_shown";

  const NOTICE_INTERVAL =
    12 * 60 * 60 * 1000;

  const getMetaContent = (selector) => {
    return (
      document
        .querySelector(selector)
        ?.content?.trim() || ""
    );
  };

  const toAbsoluteUrl = (url) => {
    if (!url) {
      return "";
    }

    try {
      return new URL(
        url,
        window.location.href
      ).href;
    } catch {
      return "";
    }
  };

  // ========================================
  // App title
  // ========================================

  const customTitle = getMetaContent(
    'meta[name="ojapp:title"]'
  );

  const pageTitle =
    customTitle ||
    document.title.trim() ||
    "OJapp";

  // ========================================
  // App icon
  // ========================================

  const customIcon = getMetaContent(
    'meta[name="ojapp:icon"]'
  );

  const appleTouchIcon =
    document
      .querySelector(
        'link[rel~="apple-touch-icon"]'
      )
      ?.getAttribute("href") || "";

  const ogImage =
    getMetaContent(
      'meta[property="og:image"]'
    ) ||
    getMetaContent(
      'meta[name="og:image"]'
    );

  const favicon =
    document
      .querySelector(
        'link[rel="icon"], ' +
        'link[rel="shortcut icon"]'
      )
      ?.getAttribute("href") || "";

  const iconUrl =
    toAbsoluteUrl(customIcon) ||
    toAbsoluteUrl(appleTouchIcon) ||
    toAbsoluteUrl(ogImage) ||
    toAbsoluteUrl(favicon) ||
    DEFAULT_ICON;

  // ========================================
  // Manifest
  // ========================================

  const cleanUrl =
    window.location.origin +
    window.location.pathname;

  const includeQuery =
    getMetaContent(
      'meta[name="ojapp:query"]'
    ).toLowerCase() === "true";

  function insertManifest() {
    const appUrl =
      cleanUrl +
      (includeQuery
        ? window.location.search
        : "");

    const manifestObj = {
      name: pageTitle,
      short_name: pageTitle,
      id: appUrl,
      start_url: appUrl,
      scope: cleanUrl,
      display: "standalone",

    icons: [
      {
        src: iconUrl,
        sizes: "any",
        purpose: "any"
      },
      {
        src: iconUrl,
        sizes: "any",
        purpose: "maskable"
      }
    ]
    };

    const jsonString =
      JSON.stringify(manifestObj);

    const base64Json = btoa(
      encodeURIComponent(jsonString).replace(
      /%([0-9A-F]{2})/g,
      (match, p1) => {
        return String.fromCharCode(
          parseInt(p1, 16)
        );
      }
    )
    );

    const dataUrl =
      "data:application/manifest+json;base64," +
      base64Json;

    document
    .querySelectorAll(
      'link[rel="manifest"]'
    )
    .forEach((element) => {
      element.remove();
    });

    const manifest =
      document.createElement("link");

    manifest.rel = "manifest";
    manifest.href = dataUrl;
    manifest.dataset.ojapp = "free";

    document.head.prepend(manifest);

    console.log(
    "OJapp manifest inserted",
    {
      executedAt:
        new Date().toISOString(),

        currentUrl:
          window.location.href,

        includeQuery,

        appUrl,

      pathname:
        window.location.pathname,

      title:
        pageTitle,

      icon:
        iconUrl,

      manifest:
        manifestObj
      }
    );
  }

  window.ojappRefreshManifest =
    insertManifest;

  insertManifest();

  // ========================================
  // Free notice language
  // ========================================

  const messages = {
    ja: {
      text:
        "このページをホーム画面に追加してアプリに",
      url:
        "https://ojapp.app/one-page-one-app"
    },

    en: {
      text:
        "Add this page to your home screen as an app.",
      url:
        "https://ojapp.app/one-page-one-app/en"
    },

    ko: {
      text:
        "이 페이지를 홈 화면에 추가하여 앱으로 사용하세요.",
      url:
        "https://ojapp.app/one-page-one-app/en"
    },

    zh: {
      text:
        "将此页面添加到主屏幕，作为应用使用。",
      url:
        "https://ojapp.app/one-page-one-app/en"
    }
  };

  const pageLanguage =
    document.documentElement.lang ||
    navigator.language ||
    "en";

  const language =
    pageLanguage
      .toLowerCase()
      .split("-")[0];

  const message =
    messages[language] ||
    messages.en;

  // ========================================
  // Free notice
  // ========================================

  function isStandaloneMode() {
    return (
      window
        .matchMedia(
          "(display-mode: standalone)"
        )
        .matches ||
      window.navigator.standalone === true
    );
  }

  function shouldShowOjappNotice() {
    try {
      const lastShown = Number(
        localStorage.getItem(
          NOTICE_STORAGE_KEY
        )
      );

      return (
        !lastShown ||
        Date.now() - lastShown >=
          NOTICE_INTERVAL
      );
    } catch {
      return true;
    }
  }

  function markOjappNoticeAsShown() {
    try {
      localStorage.setItem(
        NOTICE_STORAGE_KEY,
        String(Date.now())
      );
    } catch {
      // Storage unavailable.
    }
  }

  function showOjappNotice() {
    if (
      document.getElementById(
        "ojapp-free-notice"
      )
    ) {
      return;
    }

    const notice =
      document.createElement("div");

    notice.id =
      "ojapp-free-notice";

    notice.innerHTML = `
      <div class="ojapp-notice-text">
        ${message.text}
      </div>

      <a
        href="${message.url}"
        target="_blank"
        rel="noopener noreferrer"
        class="ojapp-notice-brand"
      >
        One Page. One App. OJapp
      </a>
    `;

    Object.assign(
      notice.style,
      {
        position: "fixed",
        left: "50%",
        bottom: "14px",

        transform:
          "translate(-50%, 20px)",

        width:
          "calc(100% - 32px)",

        maxWidth: "520px",
        boxSizing: "border-box",
        padding: "12px 16px",
        borderRadius: "14px",

        background:
          "rgba(20, 20, 24, 0.94)",

        color: "#ffffff",

        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

        fontSize: "13px",
        lineHeight: "1.55",
        textAlign: "center",

        boxShadow:
          "0 8px 30px rgba(0, 0, 0, 0.24)",

        backdropFilter:
          "blur(12px)",

        WebkitBackdropFilter:
          "blur(12px)",

        opacity: "0",
        zIndex: "2147483647",

        transition:
          "opacity 0.35s ease, transform 0.35s ease"
      }
    );

    document.body.appendChild(
      notice
    );

    const brand =
      notice.querySelector(
        ".ojapp-notice-brand"
      );

    Object.assign(
      brand.style,
      {
        display: "inline-block",
        marginTop: "6px",
        color: "#ffffff",
        fontSize: "11px",
        fontWeight: "600",
        textDecoration: "none",
        opacity: "0.72"
      }
    );

    requestAnimationFrame(() => {
      notice.style.opacity = "1";

      notice.style.transform =
        "translate(-50%, 0)";
    });

    window.setTimeout(() => {
      notice.style.opacity = "0";

      notice.style.transform =
        "translate(-50%, 20px)";

      window.setTimeout(() => {
        notice.remove();
      }, 400);
    }, 5000);
  }

  function runOjappNotice() {
    if (isStandaloneMode()) {
      return;
    }

    if (!shouldShowOjappNotice()) {
      return;
    }

    markOjappNoticeAsShown();
    showOjappNotice();
  }

  if (document.body) {
    runOjappNotice();
  } else {
    document.addEventListener(
      "DOMContentLoaded",
      runOjappNotice,
      {
        once: true
      }
    );
  }
})();
