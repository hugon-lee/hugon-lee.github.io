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
			const pageSize = parseInt(newsListEl.getAttribute("data-page-size"), 10) || null;
			const paginationEl = document.getElementById("news-pagination");

			fetch("assets/data/news.json")
				.then(function (res) { return res.json(); })
				.then(function (allItems) {
					const items = limit ? allItems.slice(0, limit) : allItems;

					function renderPage(page) {
						let toRender = items;
						if (pageSize) {
							const start = (page - 1) * pageSize;
							toRender = items.slice(start, start + pageSize);
						}

						newsListEl.innerHTML = toRender.map(function (item, idx) {
							var badgeHtml = item.badge
								? '<span class="badge badge-status">' + item.badge + '</span>'
								: '';
							var subHtml = item.sub
								? '<span class="news-sub">' + item.sub + '</span>'
								: '';
							var textHtml = item.link
								? '<a href="' + item.link + '" target="_blank" rel="noopener">' + item.text + '</a>'
								: item.text;

							var hasDetail = !!item.detail;
							var chevronHtml = hasDetail
								? '<span class="news-chevron">&#9660;</span>'
								: '';
							var detailHtml = '';
							if (hasDetail) {
								var detailImgHtml = item.detail.image
									? '<img src="' + item.detail.image + '" alt="">'
									: '';
								var detailTextHtml = item.detail.text
									? '<p>' + item.detail.text + '</p>'
									: '';
								detailHtml = '<div class="news-detail"><div class="news-detail-inner">'
									+ detailTextHtml + detailImgHtml
									+ '</div></div>';
							}

							var rowClass = hasDetail ? 'news-item-row has-detail' : 'news-item-row';

							return '<li class="news-item" data-idx="' + idx + '">'
								+ '<div class="' + rowClass + '">'
								+ '<span class="news-date">' + item.date + '</span>'
								+ '<div class="news-main">'
								+ '<div class="news-title-line">'
								+ '<span>' + textHtml + ' ' + badgeHtml + '</span>'
								+ chevronHtml
								+ '</div>'
								+ subHtml
								+ '</div>'
								+ '</div>'
								+ detailHtml
								+ '</li>';
						}).join('');

						newsListEl.querySelectorAll('.news-item-row.has-detail').forEach(function (row) {
							row.addEventListener('click', function () {
								row.closest('.news-item').classList.toggle('is-open');
							});
						});

						var overlay = document.getElementById('lightbox');
						var overlayImg = document.getElementById('lightbox-img');
						if (overlay && overlayImg) {
							newsListEl.querySelectorAll('.news-detail-inner img').forEach(function (img) {
								img.addEventListener('click', function () {
									overlayImg.src = img.src;
									overlayImg.alt = img.alt;
									overlay.classList.add('is-open');
								});
							});
						}
					}

					function renderPagination(currentPage) {
						if (!paginationEl || !pageSize) return;
						var totalPages = Math.ceil(items.length / pageSize);
						if (totalPages <= 1) {
							paginationEl.innerHTML = '';
							return;
						}
						var html = '';
						for (var p = 1; p <= totalPages; p++) {
							var activeClass = p === currentPage ? ' active' : '';
							html += '<button class="page-btn' + activeClass + '" data-page="' + p + '">' + p + '</button>';
						}
						paginationEl.innerHTML = html;

						paginationEl.querySelectorAll('.page-btn').forEach(function (btn) {
							btn.addEventListener('click', function () {
								var page = parseInt(btn.getAttribute('data-page'), 10);
								renderPage(page);
								renderPagination(page);
								newsListEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
							});
						});
					}

					renderPage(1);
					renderPagination(1);
				});
		}

		// ---------- Publications ----------
		const pubListEl = document.getElementById("pub-list-auto");
		if (pubListEl) {
			const pubPageSize = parseInt(pubListEl.getAttribute("data-page-size"), 10) || null;
			const pubPaginationEl = document.getElementById("pub-pagination");

			fetch("assets/data/publications.json")
				.then(function (res) { return res.json(); })
				.then(function (items) {

					function renderItemsWithYearHeaders(list) {
						let html = '';
						let lastYear = null;
						let listOpen = false;

						list.forEach(function (item) {
							if (item.year !== lastYear) {
								if (listOpen) html += '</ol>';
								html += '<div class="pub-year">' + item.year + '</div><ol class="pub-list">';
								listOpen = true;
								lastYear = item.year;
							}

							const badgesHtml = item.badges.map(function (b) {
								return '<span class="badge badge-' + b.type + '">' + b.label + '</span>';
							}).join('');
							const doiHtml = item.doi
								? '<a href="' + item.doi + '" target="_blank" rel="noopener">doi &rarr;</a>'
								: '';

							const thumbHtml = item.image
								? '<div class="pub-thumb"><img src="' + item.image + '" alt=""></div>'
								: '';

							html += '<li class="pub" id="' + item.id + '">'
								+ '<div class="pub-body">'
								+ '<span class="pub-title">' + item.title + '</span>'
								+ ' '
								+ (badgesHtml ? '<span class="pub-badges">' + badgesHtml + '</span>' : '')
								+ '<div class="pub-authors">' + item.authors + '</div>'
								+ '<div class="pub-venue">' + item.venue + doiHtml + '</div>'
								+ '</div>'
								+ thumbHtml
								+ '</li>';
						});

						if (listOpen) html += '</ol>';
						return html;
					}

					function bindPubExtras() {
						var overlay = document.getElementById('lightbox');
						var overlayImg = document.getElementById('lightbox-img');
						if (overlay && overlayImg) {
							pubListEl.querySelectorAll('.pub-thumb img').forEach(function (img) {
								img.addEventListener('click', function () {
									overlayImg.src = img.src;
									overlayImg.alt = img.alt;
									overlay.classList.add('is-open');
								});
							});
						}
					}

					function renderPubPage(page) {
						let toRender = items;
						if (pubPageSize) {
							const start = (page - 1) * pubPageSize;
							toRender = items.slice(start, start + pubPageSize);
						}
						pubListEl.innerHTML = renderItemsWithYearHeaders(toRender);
						bindPubExtras();
					}

					function renderPubPagination(currentPage) {
						if (!pubPaginationEl || !pubPageSize) return;
						var totalPages = Math.ceil(items.length / pubPageSize);
						if (totalPages <= 1) {
							pubPaginationEl.innerHTML = '';
							return;
						}
						var html = '';
						for (var p = 1; p <= totalPages; p++) {
							var activeClass = p === currentPage ? ' active' : '';
							html += '<button class="page-btn' + activeClass + '" data-page="' + p + '">' + p + '</button>';
						}
						pubPaginationEl.innerHTML = html;
						pubPaginationEl.querySelectorAll('.page-btn').forEach(function (btn) {
							btn.addEventListener('click', function () {
								var page = parseInt(btn.getAttribute('data-page'), 10);
								renderPubPage(page);
								renderPubPagination(page);
								pubListEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
							});
						});
					}

					// #hash로 들어온 경우 페이지네이션 무시하고 전체 렌더
					if (window.location.hash) {
						pubListEl.innerHTML = renderItemsWithYearHeaders(items);
						bindPubExtras();
						if (pubPaginationEl) pubPaginationEl.innerHTML = '';
						var target = document.getElementById(window.location.hash.slice(1));
						if (target) target.scrollIntoView();
					} else {
						renderPubPage(1);
						renderPubPagination(1);
					}
				});
		}

		// ---------- Talks ----------
		const talkListEl = document.getElementById("talk-list-auto");
		if (talkListEl) {
			const talkPageSize = parseInt(talkListEl.getAttribute("data-page-size"), 10) || null;
			const talkPaginationEl = document.getElementById("talk-pagination");

			fetch("assets/data/talks.json")
				.then(function (res) { return res.json(); })
				.then(function (items) {
					function renderTalkPage(page) {
						let toRender = items;
						if (talkPageSize) {
							const start = (page - 1) * talkPageSize;
							toRender = items.slice(start, start + talkPageSize);
						}
						talkListEl.innerHTML = toRender.map(function (item) {
							const badgesHtml = item.badges.map(function (b) {
								return '<span class="badge badge-' + b.type + '">' + b.label + '</span>';
							}).join('');
							return '<li class="talk">'
								+ '<span class="talk-title">' + item.title + '</span>'
								+ '<span class="talk-badges">' + badgesHtml + '</span>'
								+ '<div class="talk-authors">' + item.authors + '</div>'
								+ '<div class="talk-meta">' + item.meta + '</div>'
								+ '</li>';
						}).join('');
					}

					function renderTalkPagination(currentPage) {
						if (!talkPaginationEl || !talkPageSize) return;
						var totalPages = Math.ceil(items.length / talkPageSize);
						if (totalPages <= 1) {
							talkPaginationEl.innerHTML = '';
							return;
						}
						var html = '';
						for (var p = 1; p <= totalPages; p++) {
							var activeClass = p === currentPage ? ' active' : '';
							html += '<button class="page-btn' + activeClass + '" data-page="' + p + '">' + p + '</button>';
						}
						talkPaginationEl.innerHTML = html;
						talkPaginationEl.querySelectorAll('.page-btn').forEach(function (btn) {
							btn.addEventListener('click', function () {
								var page = parseInt(btn.getAttribute('data-page'), 10);
								renderTalkPage(page);
								renderTalkPagination(page);
								talkListEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
							});
						});
					}

					renderTalkPage(1);
					renderTalkPagination(1);
				});
		}

		// ---------- Projects ----------
		const projectListEl = document.getElementById("project-list-auto");
		if (projectListEl) {
			const projPageSize = parseInt(projectListEl.getAttribute("data-page-size"), 10) || null;
			const projPaginationEl = document.getElementById("project-pagination");

			fetch("assets/data/projects.json")
				.then(function (res) { return res.json(); })
				.then(function (items) {

					function renderItemsWithStatusHeaders(list) {
						let html = '';
						let lastStatus = null;
						let groupOpen = false;

						list.forEach(function (item) {
							if (item.status !== lastStatus) {
								if (groupOpen) html += '</div>'; // close previous group
								html += '<div class="project-status-header">' + item.status + '</div>';
								html += '<div class="grant-group">';
								groupOpen = true;
								lastStatus = item.status;
							}

							// const badgeLabel = item.fundingType.toUpperCase();
							// const badgeHtml = '<span class="badge badge-' + item.fundingType + '">' + badgeLabel + '</span>';
							const fundingLabels = { government: 'GOV', industry: 'IND', internal: 'INT' };
							const badgeLabel = fundingLabels[item.fundingType] || item.fundingType.toUpperCase();
							const badgeHtml = '<span class="badge badge-' + item.fundingType + '">' + badgeLabel + '</span>';
							const piHtml = item.pi ? ' (PI: ' + item.pi + ')' : '';
							const roleClass = item.role === 'Principal Investigator' ? 'role-pi' : 'role-participant';
							const roleHtml = '<span class="grant-role ' + roleClass + '">' + item.role + '</span>';
							const thumbHtml = item.image
								? '<div class="grant-thumb"><img src="' + item.image + '" alt=""></div>'
								: '';
							const sideClass = item.imageSide === "left" ? "img-left" : "img-right";
							const titleKrHtml = item.titleKr
								? '<div class="grant-title-kr">' + item.titleKr + '</div>'
								: '';

							html += '<div class="grant-entry ' + sideClass + '">'
								// + '<div class="grant-meta">' + item.funder + ' &middot; ' + item.period + ' &middot; ' + roleHtml + piHtml + '</div>'
								+ '<div class="grant-meta">' + item.funder + ' &middot; ' + roleHtml + piHtml + '</div>'
								+ '<div class="grant-main-row">'
								+ '<div class="grant-body">'
								// + '<div class="grant-title">' + item.title + ' '+ badgeHtml + '</div>'
								+ '<div class="grant-title">' + item.title + ' (' + item.period + ') '+ badgeHtml + '</div>'
								+ titleKrHtml
								+ '<div class="grant-desc">' + item.desc + '</div>'
								+ '</div>'
								+ thumbHtml
								+ '</div>'
								+ '</div>';
						});

						if (groupOpen) html += '</div>'; // close last group
						return html;
					}

					function bindProjectExtras() {
						var overlay = document.getElementById('lightbox');
						var overlayImg = document.getElementById('lightbox-img');
						if (overlay && overlayImg) {
							projectListEl.querySelectorAll('.grant-thumb img').forEach(function (img) {
								img.addEventListener('click', function () {
									overlayImg.src = img.src;
									overlayImg.alt = img.alt;
									overlay.classList.add('is-open');
								});
							});
						}
					}

					function renderProjectPage(page) {
						let toRender = items;
						if (projPageSize) {
							const start = (page - 1) * projPageSize;
							toRender = items.slice(start, start + projPageSize);
						}
						projectListEl.innerHTML = renderItemsWithStatusHeaders(toRender);
						bindProjectExtras();
					}

					function renderProjectPagination(currentPage) {
						if (!projPaginationEl || !projPageSize) return;
						var totalPages = Math.ceil(items.length / projPageSize);
						if (totalPages <= 1) {
							projPaginationEl.innerHTML = '';
							return;
						}
						var html = '';
						for (var p = 1; p <= totalPages; p++) {
							var activeClass = p === currentPage ? ' active' : '';
							html += '<button class="page-btn' + activeClass + '" data-page="' + p + '">' + p + '</button>';
						}
						projPaginationEl.innerHTML = html;
						projPaginationEl.querySelectorAll('.page-btn').forEach(function (btn) {
							btn.addEventListener('click', function () {
								var page = parseInt(btn.getAttribute('data-page'), 10);
								renderProjectPage(page);
								renderProjectPagination(page);
								projectListEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
							});
						});
					}

					renderProjectPage(1);
					renderProjectPagination(1);
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

	document.querySelectorAll(".pub-thumb img, .thread-figure img, .project-thumb img, .grant-thumb img, .news-detail-inner img").forEach(function (img) {
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