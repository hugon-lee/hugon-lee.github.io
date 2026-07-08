(function () {
	const root = document.documentElement;
	const STORAGE_KEY = "theme-preference";

	function getPreferredTheme() {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored === "light" || stored === "dark") {
			return stored;
		}
		return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
	}

	function applyTheme(theme) {
		root.setAttribute("data-theme", theme);
		const btn = document.getElementById("theme-toggle");
		if (btn) {
			btn.textContent = theme === "dark" ? "light" : "dark";
		}
	}

	applyTheme(getPreferredTheme());

	document.addEventListener("DOMContentLoaded", function () {

		const newsListEl = document.getElementById("news-list-auto");
		if (newsListEl) {
			const limit = parseInt(newsListEl.getAttribute("data-limit"), 10) || null;
			fetch("assets/data/news.json")
				.then(function (res) { return res.json(); })
				.then(function (items) {
					const toRender = limit ? items.slice(0, limit) : items;
					newsListEl.innerHTML = toRender.map(function (item) {
						const badgeHtml = item.badge
							? '<span class="badge badge-status">' + item.badge + '</span>'
							: '';
						const subHtml = item.sub
							? '<span class="news-sub">' + item.sub + '</span>'
							: '';
						const textHtml = item.link
							? '<a href="' + item.link + '" target="_blank" rel="noopener">' + item.text + '</a>'
							: item.text;
						return '<li class="news-item">'
							+ '<span class="news-date">' + item.date + '</span>'
							+ '<span>' + textHtml + ' ' + badgeHtml + subHtml + '</span>'
							+ '</li>';
					}).join('');
				});
		}

		fetch("partials/nav.html")
			.then(function (res) { return res.text(); })
			.then(function (html) {
				const navPlaceholder = document.getElementById("nav-placeholder");
				if (!navPlaceholder) return;
				navPlaceholder.innerHTML = html;

				const currentPage = document.body.getAttribute("data-page");
				const activeLink = document.querySelector('.nav-links a[data-page="' + currentPage + '"]');
				if (activeLink) activeLink.classList.add("active");

				const btn = document.getElementById("theme-toggle");
				if (btn) {
					btn.textContent = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
					btn.addEventListener("click", function () {
						const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
						localStorage.setItem(STORAGE_KEY, next);
						applyTheme(next);
					});
				}
			});

		fetch("partials/footer.html")
			.then(function (res) { return res.text(); })
			.then(function (html) {
				const footerPlaceholder = document.getElementById("footer-placeholder");
				if (footerPlaceholder) {
					footerPlaceholder.innerHTML = html;

					const yearEl = document.getElementById("copyright-year");
					if (yearEl) {
						yearEl.textContent = new Date().getFullYear();
					}
				}
			});
	});

	window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
		if (!localStorage.getItem(STORAGE_KEY)) {
			applyTheme(e.matches ? "dark" : "light");
		}
	});
})();

(function () {
	const overlay = document.getElementById("lightbox");
	if (!overlay) return;

	const overlayImg = document.getElementById("lightbox-img");

	document.querySelectorAll(".pub-thumb img, .thread-figure img, .project-thumb img, .grant-thumb img").forEach(function (img) {
		img.addEventListener("click", function () {
			overlayImg.src = img.src;
			overlayImg.alt = img.alt;
			overlay.classList.add("is-open");
		});
	});

	overlay.addEventListener("click", function () {
		overlay.classList.remove("is-open");
		overlayImg.src = "";
	});

	document.addEventListener("keydown", function (e) {
		if (e.key === "Escape") {
			overlay.classList.remove("is-open");
			overlayImg.src = "";
		}
	});
})();

(function () {
	const toggles = document.querySelectorAll(".thread-toggle");
	if (toggles.length === 0) return;

	toggles.forEach(function (toggle) {
		toggle.addEventListener("click", function () {
			const thread = toggle.closest(".thread");
			thread.classList.toggle("is-open");
		});
	});
})();