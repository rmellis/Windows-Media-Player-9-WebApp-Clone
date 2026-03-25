/* --- MENU BAR LOGIC --- */
let menuActive = false;

document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('mousedown', (e) => {
        if (e.target.closest('.dropdown')) {
            return; 
        }
        
        const wasOpen = item.classList.contains('open');
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('open'));
        
        if (!wasOpen) {
            item.classList.add('open');
            menuActive = true;
        } else {
            menuActive = false;
        }
    });

    item.addEventListener('mouseenter', () => {
        if (menuActive && !item.classList.contains('open')) {
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('open'));
            item.classList.add('open');
        }
    });
});

const floatingTab = document.getElementById('now-playing-floater');
if (floatingTab) {
    floatingTab.addEventListener('mousedown', (e) => {
        if (e.target.closest('.dropdown')) return;
        floatingTab.classList.toggle('open');
    });
}

document.addEventListener('mousedown', (e) => {
    if (!e.target.closest('.menu-item')) {
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('open'));
        menuActive = false;
    }
    if (floatingTab && !e.target.closest('#now-playing-floater')) {
        floatingTab.classList.remove('open');
    }
});

document.addEventListener('click', (e) => {
    if (e.target.closest('.dropdown-item:not(.nested-dropdown-parent)')) {
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('open'));
        menuActive = false;
    }
});

/* --- CORNER OVERLAY LOGIC --- */
const cornerOverlay = document.querySelector('.wmp9-corner-overlay');
function updateCornerOverlay(isYouTube) {
    if (!cornerOverlay) return;
    const ytSrc = "https://proxy.duckduckgo.com/iu/?u=https://i.imgur.com/VJkd7LX.png";
    const wpSrc = "https://proxy.duckduckgo.com/iu/?u=https://i.imgur.com/LMXkhOV.png";
    const targetSrc = isYouTube ? ytSrc : wpSrc;
    
    if (cornerOverlay.src === targetSrc || cornerOverlay.dataset.fading === 'true') return;
    
    cornerOverlay.dataset.fading = 'true';

    const fadeImg = document.createElement('img');
    fadeImg.src = targetSrc;
    fadeImg.className = cornerOverlay.className;
    fadeImg.style.position = 'absolute';
    fadeImg.style.top = '0';
    fadeImg.style.left = '0';
    fadeImg.style.width = '100%';
    fadeImg.style.height = 'calc(100% + 4px)';
    fadeImg.style.marginTop = '-3px';
    fadeImg.style.marginBottom = '-1px';
    fadeImg.style.objectFit = 'cover';
    fadeImg.style.zIndex = '10000';
    fadeImg.style.opacity = '0';
    fadeImg.style.transition = 'opacity 0.3s ease';
    fadeImg.style.pointerEvents = 'none';
    
    cornerOverlay.parentNode.appendChild(fadeImg);
    
    void fadeImg.offsetWidth;
    
    fadeImg.style.opacity = '1';
    
    setTimeout(() => {
        cornerOverlay.src = targetSrc;
        if (fadeImg.parentNode) fadeImg.parentNode.removeChild(fadeImg);
        cornerOverlay.dataset.fading = 'false';
    }, 300);
}

/* --- CONTEXT MENU --- */
const contextMenu = document.getElementById('vlc-context-menu');
const mainDisplayArea = document.getElementById('playlist-drop-zone');

mainDisplayArea.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    let x = e.clientX;
    let y = e.clientY;
    
    contextMenu.style.display = 'block';
    const rect = contextMenu.getBoundingClientRect();
    
    if (x + rect.width > window.innerWidth) {
        x = window.innerWidth - rect.width;
    }
    if (y + rect.height > window.innerHeight) {
        y = window.innerHeight - rect.height;
    }
    
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    contextMenu.classList.add('show');
    
    const nestedMenus = contextMenu.querySelectorAll('.context-nested');
    nestedMenus.forEach(nested => {
        nested.classList.remove('flip-left');
        if (x + rect.width + 120 > window.innerWidth) {
            nested.classList.add('flip-left');
        }
    });
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.context-menu')) {
        contextMenu.classList.remove('show');
        contextMenu.style.display = 'none';
    }
});

contextMenu.addEventListener('click', (e) => {
    if (e.target.closest('.context-item:not(.context-nested-parent)')) {
        contextMenu.classList.remove('show');
        contextMenu.style.display = 'none';
    }
});

/* --- SYSTEM LOGGING --- */
function logSystem(msg, type = 'info') {
    const statusEl = document.getElementById('video-title') || document.getElementById('wmp9-video-title');
    const bottomStatus = document.getElementById('wmp9-status-text');

    if (statusEl && statusEl.innerText !== msg) {
        statusEl.innerText = msg;
    }
    if (bottomStatus && bottomStatus.innerText !== msg) {
        bottomStatus.innerText = msg;
    }
    
    console.log(`[${type.toUpperCase()}] ${msg}`);
    
    clearTimeout(window.logTimeout);
    window.logTimeout = setTimeout(() => {
        if (statusEl) {
            if (currentTrackIndex !== -1 && playlist[currentTrackIndex]) {
                statusEl.innerText = playlist[currentTrackIndex].title || playlist[currentTrackIndex].file.name;
                if(bottomStatus) {
                    let track = playlist[currentTrackIndex];
                    let isStream = (track.folder === 'Network');
                    let isYT = track.isYouTube;
                    let prefix = isStream ? "Streaming: " : "Playing: ";
                    let spd = track.speed || (isYT ? "720p" : (isStream ? "128K" : ""));
                    let speedText = spd ? " [" + spd + "]" : "";
                    bottomStatus.innerText = prefix + (track.title || track.file.name) + speedText;
                }
            } else {
                statusEl.innerText = "Windows Media Player";
                if(bottomStatus) {
                    bottomStatus.innerText = "Ready";
                }
            }
        }
        
        const artistEl = document.getElementById('video-artist') || document.getElementById('wmp9-video-artist');
        if (artistEl) {
            if (currentTrackIndex !== -1 && playlist[currentTrackIndex]) {
                artistEl.innerText = playlist[currentTrackIndex].folder || "Library";
            } else {
                artistEl.innerText = "Ready";
            }
        }
    }, 5000);
}

window.onerror = function(message, source, lineno, colno, error) {
    logSystem(`Error: ${message}`, 'error');
};

/* --- DIALOGS & UI STATES --- */
function openDialog(id) { 
    document.getElementById(id).style.display = 'flex'; 
}

function closeDialog(id) { 
    document.getElementById(id).style.display = 'none'; 
}

function toggleMaximize(id) {
    const dialog = document.getElementById(id);
    if (!dialog) return;

    if (dialog.dataset.maximized === 'true') {
        // Restore
        dialog.dataset.maximized = 'false';
        dialog.style.width = dialog.dataset.origWidth || '';
        dialog.style.height = dialog.dataset.origHeight || '';
        dialog.style.top = dialog.dataset.origTop || '';
        dialog.style.left = dialog.dataset.origLeft || '';
        dialog.style.transform = dialog.dataset.origTransform || '';
        dialog.style.borderRadius = '';
        const icon = dialog.querySelector('.dialog-maximize i');
        if (icon) icon.className = 'ph-bold ph-square';
    } else {
        // Maximize
        dialog.dataset.maximized = 'true';
        dialog.dataset.origWidth = dialog.style.width;
        dialog.dataset.origHeight = dialog.style.height;
        dialog.dataset.origTop = dialog.style.top;
        dialog.dataset.origLeft = dialog.style.left;
        dialog.dataset.origTransform = dialog.style.transform;

        dialog.style.width = '100vw';
        dialog.style.height = '100vh';
        dialog.style.top = '0';
        dialog.style.left = '0';
        dialog.style.transform = 'none';
        dialog.style.borderRadius = '0';
        const icon = dialog.querySelector('.dialog-maximize i');
        if (icon) icon.className = 'ph-bold ph-copy';
    }
}

function toggleAdvancedControls() { 
    document.getElementById('adv-controls').classList.toggle('show'); 
}

let playlistVisible = true; 
function togglePlaylist() {
    playlistVisible = !playlistVisible;
    const view = document.getElementById('playlist-view');
    const centerPane = document.getElementById('playlist-drop-zone');
    const revealBtn = document.getElementById('reveal-right-btn');
    
    if (view) {
        view.style.display = playlistVisible ? 'flex' : 'none';
    }
    
    if (revealBtn) {
        revealBtn.style.display = playlistVisible ? 'none' : 'flex';
    }
    
    if (centerPane) {
        if (playlistVisible) {
            centerPane.style.gridColumn = '2'; 
            centerPane.style.borderRight = 'none';
        } else {
            centerPane.style.gridColumn = '2 / 4'; 
            centerPane.style.borderRight = '1px solid var(--wmp9-border-light)'; 
        }
    }
    
    setTimeout(window.applyAspectRatio, 50);
}

function switchFilterTab(tabId, btn) {
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');
};

/* --- DRAGGABLE MODALS --- */
let activeDialog = null;
let fsDragActive = false;
let offsetX = 0, offsetY = 0;
let fsOffsetX = 0, fsOffsetY = 0;

const fsBar = document.getElementById('fs-control-bar');
const dropZone = document.getElementById('playlist-drop-zone');

document.querySelectorAll('.dialog-header').forEach(header => {
    header.addEventListener('mousedown', (e) => {
        if (e.target.closest('button')) return; 
        activeDialog = header.parentElement;
        
        // Prevent dragging if the dialog is maximized
        if (activeDialog.dataset.maximized === 'true') {
            activeDialog = null;
            return;
        }

        const rect = activeDialog.getBoundingClientRect();
        activeDialog.style.transform = 'none';
        activeDialog.style.left = rect.left + 'px';
        activeDialog.style.top = rect.top + 'px';
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
    });
});

if (fsBar) {
    fsBar.addEventListener('mousedown', (e) => {
        if (e.target.closest('button, svg, input')) return;
        fsDragActive = true;
        const rect = fsBar.getBoundingClientRect();
        fsBar.style.transform = 'none';
        fsBar.style.bottom = 'auto'; 
        fsBar.style.left = rect.left + 'px';
        fsBar.style.top = rect.top + 'px';
        fsOffsetX = e.clientX - rect.left;
        fsOffsetY = e.clientY - rect.top;
    });
}

document.addEventListener('mousemove', (e) => {
    if (activeDialog) {
        activeDialog.style.left = (e.clientX - offsetX) + 'px';
        activeDialog.style.top = (e.clientY - offsetY) + 'px';
    }
    if (fsDragActive && fsBar) {
        fsBar.style.left = (e.clientX - fsOffsetX) + 'px';
        fsBar.style.top = (e.clientY - fsOffsetY) + 'px';
    }
    if (isSpatialEnabled && panner) {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const z = (e.clientY / window.innerHeight) * 2 - 1;
        panner.setPosition(x * 5, 0, z * 5 + 1);
    }
    if (document.fullscreenElement) {
        showFsBar();
    }
});

document.addEventListener('mouseup', () => { 
    activeDialog = null; 
    fsDragActive = false; 
});

/* --- GLOBAL STATE & INITIALIZATION --- */
const MAX_PLAYLIST_SIZE = 5000; 
let playlist = [];
let currentTrackIndex = -1;
window.visTimeout = null; 
window.hlsInstance = null; 

window.activeVisMode = 'ambiance'; 

let audioCtx, panner, audioSource;
let analyser = null; 
let volumeGainNode = null;
let eqFilters = [];
let isSpatialEnabled = false;
let audioInitialized = false;

let subtitleTracks = [];
let ytActive = false;

let mainPlayer = document.getElementById('main-player');
const ytPlayer = document.getElementById('yt-player');
const albumArt = document.getElementById('album-art');
const visualizer = document.getElementById('wmp9-visualizer');
const idleLogo = document.getElementById('idle-logo');
const playlistList = document.getElementById('playlist-list');
const progressBar = document.getElementById('progress-fill');
const progressThumb = document.getElementById('progress-thumb');
const fsProgressBar = document.getElementById('fs-progress-fill');

window.activeView = 'now-playing';

/* --- CORS PROXY ENGINE --- */
const PROXIES = [
    { url: "https://api.allorigins.win/get?url=", type: "json" },
    { url: "https://corsproxy.io/?", type: "raw" },
    { url: "https://api.codetabs.com/v1/proxy?quest=", type: "raw" }
];

async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 8000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
}

async function raceProxies(targetUrl) {
    const promises = PROXIES.map(async (proxy) => {
        try {
            const res = await fetchWithTimeout(proxy.url + encodeURIComponent(targetUrl));
            if (!res.ok) throw new Error("Status " + res.status);
            let text = proxy.type === "json" ? (await res.json()).contents : await res.text();
            if (!text || text.length < 50) throw new Error("Empty content");
            return text; 
        } catch (e) { throw e; }
    });
    return await Promise.any(promises);
}

function scrollToBottom() {
    setTimeout(() => {
        const plContainer = document.querySelector('.wmp9-playlist-list-container');
        if (plContainer) plContainer.scrollTop = plContainer.scrollHeight;
        const libContainer = document.getElementById('library-track-list');
        if (libContainer) libContainer.scrollTop = libContainer.scrollHeight;
    }, 50);
}

/* --- VISUALIZATIONS --- */
const ambianceVideos = [
    'https://saw.floydcraft.co.uk/wmp9-ambiance/A1.webm',
    'https://saw.floydcraft.co.uk/wmp9-ambiance/A2.webm',
    'https://saw.floydcraft.co.uk/wmp9-ambiance/A3.webm',
    'https://saw.floydcraft.co.uk/wmp9-ambiance/A4.webm',
    'https://saw.floydcraft.co.uk/wmp9-ambiance/A5.webm',
    'https://saw.floydcraft.co.uk/wmp9-ambiance/A6.webm',
    'https://saw.floydcraft.co.uk/wmp9-ambiance/A7.webm',
    'https://saw.floydcraft.co.uk/wmp9-ambiance/A8.webm'
];

let currentAmbianceIndex = 0;

window.setVisualizationMode = function(mode) {
    if (currentTrackIndex === -1 || !playlist[currentTrackIndex]) return;
    
    window.activeVisMode = mode;
    
    let visName = "Album Art";
    if (mode === 'ambiance') visName = "Ambiance";
    else if (mode === 'vis') visName = "Battery";
    
    logSystem("Visualization: " + visName);
    
    const visItems = document.querySelectorAll('#visMenuList .dropdown-item');
    if(visItems.length > 0) {
        visItems.forEach(item => item.classList.remove('active-state'));
        if(mode === 'ambiance') { if(visItems[0]) visItems[0].classList.add('active-state'); }
        else if(mode === 'vis') { if(visItems[1]) visItems[1].classList.add('active-state'); }
        else { if(visItems[2]) visItems[2].classList.add('active-state'); }
    }

    const track = playlist[currentTrackIndex];
    const isVideoFile = track.file && track.file.name ? track.file.name.toLowerCase().match(/\.(mp4|webm|ogg|m4v|mov)$/) : (track.file && track.file.type && track.file.type.startsWith('video'));
    const isVideoUrl = typeof track.url === 'string' && track.url.match(/\.(mp4)$/i);
    const isVideo = isVideoFile || isVideoUrl;
    
    if (!isVideo && !ytActive) {
        if (window.activeVisMode === 'ambiance' || window.activeVisMode === 'vis') {
            if (albumArt) albumArt.style.display = 'none';
            if (visualizer) {
                clearTimeout(window.visTimeout);
                visualizer.style.display = 'block';
                
                visualizer.muted = true;
                visualizer.setAttribute('muted', '');
                visualizer.setAttribute('playsinline', '');

                const spinner = document.getElementById('mg-spinner');
                
                const makeVisibleAndPlay = () => {
                    if (spinner) spinner.style.display = 'none';
                    visualizer.style.opacity = '1';
                    if (!mainPlayer.paused && !mainPlayer.ended && typeof visualizer.play === 'function' && visualizer.paused) {
                        const playPromise = visualizer.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(e => console.log("Vis play error", e));
                        }
                    }
                };

                visualizer.onloadeddata = makeVisibleAndPlay;
                visualizer.oncanplay = makeVisibleAndPlay;
                visualizer.onplaying = makeVisibleAndPlay;
                
                if (window.activeVisMode === 'ambiance') {
                    visualizer.removeAttribute('loop');
                    
                    visualizer.onended = () => {
                        window.shuffleAmbiance(); 
                    };

                    let isCurrentAmbiance = ambianceVideos.some(v => visualizer.src.includes(v.split('/').pop()));
                    
                    if (!isCurrentAmbiance || !visualizer.src) {
                        visualizer.style.opacity = '0';
                        if (spinner && window.activeView === 'now-playing') spinner.style.display = 'block';
                        
                        visualizer.src = ambianceVideos[currentAmbianceIndex];
                        visualizer.load();
                        
                        setTimeout(makeVisibleAndPlay, 1500); 
                    } else {
                        makeVisibleAndPlay();
                    }
                } else {
                    visualizer.setAttribute('loop', '');
                    visualizer.onended = null;
                    
                    const targetSrc = 'https://saw.floydcraft.co.uk/1080p.webm';
                    if (!visualizer.src || !visualizer.src.includes(targetSrc.split('/').pop())) {
                        visualizer.style.opacity = '0';
                        if (spinner && window.activeView === 'now-playing') spinner.style.display = 'block';
                        
                        visualizer.src = targetSrc;
                        visualizer.load();
                        
                        setTimeout(makeVisibleAndPlay, 1500); 
                    } else {
                        makeVisibleAndPlay();
                    }
                }
            }
        } else {
            if (visualizer) {
                visualizer.style.opacity = '0';
                clearTimeout(window.visTimeout);
                window.visTimeout = setTimeout(() => {
                    visualizer.style.display = 'none';
                    if (typeof visualizer.pause === 'function') visualizer.pause();
                }, 500);
            }
            if (albumArt) {
                albumArt.style.display = 'block';
            }
        }
    }
};

window.cycleVisualizer = function(dir) {
    if (currentTrackIndex === -1 || !playlist[currentTrackIndex]) return;
    const modes = ['ambiance', 'vis', 'art'];
    let currentIdx = modes.indexOf(window.activeVisMode);
    if (currentIdx === -1) currentIdx = 0;
    
    let nextIdx = (currentIdx + dir) % modes.length;
    if (nextIdx < 0) nextIdx += modes.length;
    
    window.setVisualizationMode(modes[nextIdx]);
};

window.shuffleAmbiance = function() {
    if (window.activeVisMode === 'ambiance' && visualizer) {
        logSystem("Next Ambiance...");
        
        currentAmbianceIndex = (currentAmbianceIndex + 1) % ambianceVideos.length;
        const nextVid = ambianceVideos[currentAmbianceIndex];
        
        visualizer.style.opacity = '0';
        const spinner = document.getElementById('mg-spinner');
        if (spinner && window.activeView === 'now-playing') spinner.style.display = 'block';
        
        setTimeout(() => {
            visualizer.src = nextVid;
            visualizer.load();
            
            const forcePlay = () => {
                visualizer.style.opacity = '1';
                if (spinner) spinner.style.display = 'none';
                if (!mainPlayer.paused && !mainPlayer.ended && typeof visualizer.play === 'function' && visualizer.paused) {
                    visualizer.play().catch(e => console.log(e));
                }
            };
            
            setTimeout(forcePlay, 1500); 
        }, 300);
    } else {
        logSystem("Switch to Ambiance to change track", "warning");
    }
};

/* --- VIEW NAVIGATION --- */
window.startMockBurn = function() {
    logSystem("Preparing to copy...");
    setTimeout(() => {
        logSystem("Copying Track 1... 12%");
    }, 2000);
};

window.stopMockBurn = function() {
    logSystem("Copy canceled.");
    setTimeout(() => {
        logSystem("Ready");
    }, 2000);
};

window.switchPremiumService = function(serviceId, element) {
    document.querySelectorAll('.ps-service-item').forEach(el => el.classList.remove('active'));
    if (element) element.classList.add('active');
    
    document.querySelectorAll('.ps-service-pane').forEach(pane => pane.classList.remove('active'));
    
    const activePane = document.getElementById('ps-pane-' + serviceId);
    if (activePane) {
        activePane.classList.add('active');
    }
    
    const bannerTitle = document.getElementById('ps-banner-title');
    if (bannerTitle) {
        if (serviceId === 'home') bannerTitle.innerText = "Welcome!";
        else if (serviceId === 'napster') bannerTitle.innerText = "Napster";
        else if (serviceId === 'pressplay') bannerTitle.innerText = "pressplay";
        else if (serviceId === 'cinemanow') bannerTitle.innerText = "CinemaNow";
        else if (serviceId === 'msn') bannerTitle.innerText = "MSN Music Club";
        else if (serviceId === 'fullaudio') bannerTitle.innerText = "FullAudio";
        else if (serviceId === 'intertainer') bannerTitle.innerText = "Intertainer";
    }
};

window.rtRefreshStream = function() {
    logSystem("Refreshing Stream...");
    const idx = currentTrackIndex;
    window.stopTrack();
    if (idx !== -1 && playlist[idx]) {
        setTimeout(() => {
            loadTrack(idx);
        }, 800);
    } else {
        setTimeout(() => logSystem("Ready"), 800);
    }
};

window.rtRefresh = function() {
    logSystem("Refreshing page...");
    const frame = document.getElementById('media-guide-frame');
    if (frame) {
        try { frame.contentWindow.location.reload(); } catch(e) { frame.src = frame.src; }
    }
    setTimeout(() => logSystem("Ready"), 1500);
};

window.showMediaGuide = async function() {
    window.activeView = 'media-guide';
    
    document.querySelector('.wmp9-window').classList.add('media-guide-mode');
    document.querySelector('.wmp9-window').classList.remove('copy-cd-mode');
    document.querySelector('.wmp9-window').classList.remove('copy-to-cd-mode');
    document.querySelector('.wmp9-window').classList.remove('media-library-mode');
    document.querySelector('.wmp9-window').classList.remove('radio-tuner-mode');
    document.querySelector('.wmp9-window').classList.remove('premium-services-mode');
    document.querySelector('.wmp9-window').classList.remove('chooser-mode');
    
    document.querySelectorAll('.wmp9-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        let caret = btn.querySelector('.wmp9-nav-caret');
        if(caret) caret.remove();
    });
    const mgBtn = document.getElementById('nav-media-guide');
    if(mgBtn) {
        mgBtn.classList.add('active');
        mgBtn.innerHTML += '<div class="wmp9-nav-caret"></div>';
    }
    
    const centerPane = document.getElementById('playlist-drop-zone');
    if (centerPane) {
        centerPane.classList.remove('copy-cd-active');
        centerPane.classList.remove('copy-to-cd-active');
        centerPane.classList.remove('media-library-active');
        centerPane.classList.remove('radio-tuner-active');
        centerPane.classList.remove('premium-services-active');
        centerPane.classList.remove('skin-chooser-active');
        centerPane.classList.add('media-guide-active');
    }
    
    const frame = document.getElementById('media-guide-frame');
    const spinner = document.getElementById('mg-spinner');
    
    if (frame && !frame.getAttribute('data-loaded')) {
        logSystem("Loading Media Guide...");
        if(spinner) spinner.style.display = 'block';
        frame.style.opacity = '0'; 
        
        try {
            const targetUrl = 'https://web.archive.org/web/20020813081029/http://www.windowsmedia.com/mg/Music.asp';
            let content = await raceProxies(targetUrl);
            
            if (!content.toLowerCase().includes("<base")) {
                if (content.toLowerCase().includes("<head")) {
                    content = content.replace(/<head[^>]*>/i, `$&<base href="${targetUrl}">`);
                } else {
                    content = `<base href="${targetUrl}">` + content;
                }
            }
            
            frame.removeAttribute("src"); 
            frame.srcdoc = content;
            frame.setAttribute('data-loaded', 'true');
            
            setTimeout(() => {
                if(spinner) spinner.style.display = 'none';
                frame.style.opacity = '1';
            }, 500);
            
            if (window.activeView === 'media-guide') {
                logSystem("WindowsMedia.com");
            }
        } catch (err) {
            console.error("Proxy failed:", err);
            if (window.activeView === 'media-guide') {
                logSystem("Failed to load Media Guide", "error");
            }
            frame.onload = () => {
                if(spinner) spinner.style.display = 'none';
                frame.style.opacity = '1';
            };
            frame.src = 'https://web.archive.org/web/20020813081029if_/http://www.windowsmedia.com/mg/Music.asp';
        }
    } else if (frame && frame.getAttribute('data-loaded')) {
        if (window.activeView === 'media-guide') {
            logSystem("WindowsMedia.com");
        }
    }
};

window.showNowPlaying = function() {
    window.activeView = 'now-playing';
    
    document.querySelector('.wmp9-window').classList.remove('media-guide-mode');
    document.querySelector('.wmp9-window').classList.remove('copy-cd-mode');
    document.querySelector('.wmp9-window').classList.remove('copy-to-cd-mode');
    document.querySelector('.wmp9-window').classList.remove('media-library-mode');
    document.querySelector('.wmp9-window').classList.remove('radio-tuner-mode');
    document.querySelector('.wmp9-window').classList.remove('premium-services-mode');
    document.querySelector('.wmp9-window').classList.remove('chooser-mode');
    
    document.querySelectorAll('.wmp9-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        let caret = btn.querySelector('.wmp9-nav-caret');
        if(caret) caret.remove();
    });
    const npBtn = document.getElementById('nav-now-playing');
    if(npBtn) {
        npBtn.classList.add('active');
        npBtn.innerHTML += '<div class="wmp9-nav-caret"></div>';
    }
    
    const centerPane = document.getElementById('playlist-drop-zone');
    if (centerPane) {
        centerPane.classList.remove('media-guide-active');
        centerPane.classList.remove('copy-cd-active');
        centerPane.classList.remove('copy-to-cd-active');
        centerPane.classList.remove('media-library-active');
        centerPane.classList.remove('radio-tuner-active');
        centerPane.classList.remove('premium-services-active');
        centerPane.classList.remove('skin-chooser-active');
    }
    
    if (currentTrackIndex !== -1 && playlist[currentTrackIndex]) {
        let track = playlist[currentTrackIndex];
        let isStream = (track.folder === 'Network');
        let isYT = track.isYouTube;
        let spd = track.speed || (isYT ? "720p" : (isStream ? "128K" : ""));
        let speedText = spd ? " [" + spd + "]" : "";
        logSystem((track.title || track.file.name) + speedText);
        
        window.setVisualizationMode(window.activeVisMode);
    } else {
        logSystem("Windows Media Player");
    }
};

window.showCopyFromCD = function() {
    window.activeView = 'copy-cd';
    
    document.querySelector('.wmp9-window').classList.remove('media-guide-mode');
    document.querySelector('.wmp9-window').classList.remove('media-library-mode');
    document.querySelector('.wmp9-window').classList.remove('copy-to-cd-mode');
    document.querySelector('.wmp9-window').classList.remove('radio-tuner-mode');
    document.querySelector('.wmp9-window').classList.remove('premium-services-mode');
    document.querySelector('.wmp9-window').classList.remove('chooser-mode');
    document.querySelector('.wmp9-window').classList.add('copy-cd-mode'); 
    
    document.querySelectorAll('.wmp9-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        let caret = btn.querySelector('.wmp9-nav-caret');
        if(caret) caret.remove();
    });
    const cdBtn = document.getElementById('nav-copy-cd');
    if(cdBtn) {
        cdBtn.classList.add('active');
        cdBtn.innerHTML += '<div class="wmp9-nav-caret"></div>';
    }
    
    const centerPane = document.getElementById('playlist-drop-zone');
    if (centerPane) {
        centerPane.classList.remove('media-guide-active');
        centerPane.classList.remove('media-library-active');
        centerPane.classList.remove('copy-to-cd-active');
        centerPane.classList.remove('radio-tuner-active');
        centerPane.classList.remove('premium-services-active');
        centerPane.classList.remove('skin-chooser-active');
        centerPane.classList.add('copy-cd-active');
    }
};

window.showCopyToCD = function() {
    window.activeView = 'copy-to-cd';
    
    document.querySelector('.wmp9-window').classList.remove('media-guide-mode');
    document.querySelector('.wmp9-window').classList.remove('media-library-mode');
    document.querySelector('.wmp9-window').classList.remove('copy-cd-mode');
    document.querySelector('.wmp9-window').classList.remove('radio-tuner-mode');
    document.querySelector('.wmp9-window').classList.remove('premium-services-mode');
    document.querySelector('.wmp9-window').classList.remove('chooser-mode');
    document.querySelector('.wmp9-window').classList.add('copy-to-cd-mode'); 
    
    document.querySelectorAll('.wmp9-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        let caret = btn.querySelector('.wmp9-nav-caret');
        if(caret) caret.remove();
    });
    const cdBtn = document.getElementById('nav-copy-to-cd');
    if(cdBtn) {
        cdBtn.classList.add('active');
        cdBtn.innerHTML += '<div class="wmp9-nav-caret"></div>';
    }
    
    const centerPane = document.getElementById('playlist-drop-zone');
    if (centerPane) {
        centerPane.classList.remove('media-guide-active');
        centerPane.classList.remove('media-library-active');
        centerPane.classList.remove('copy-cd-active');
        centerPane.classList.remove('radio-tuner-active');
        centerPane.classList.remove('premium-services-active');
        centerPane.classList.remove('skin-chooser-active');
        centerPane.classList.add('copy-to-cd-active');
    }
    
    const burnListBody = document.querySelector('.burn-left .burn-list-body');
    if (burnListBody) {
        burnListBody.innerHTML = '';
        if (playlist.length === 0) {
            burnListBody.innerHTML = '<div class="burn-empty-text" style="padding:10px;">Playlist is empty.</div>';
        } else {
            playlist.forEach((track, i) => {
                const name = track.title || track.file.name || "Unknown";
                const item = document.createElement('div');
                item.className = 'burn-list-item';
                item.innerHTML = `
                    <div class="burn-col-check"><input type="checkbox" checked disabled></div>
                    <div class="burn-col-title">${name}</div>
                    <div class="burn-col-status">Ready to copy</div>
                    <div class="burn-col-length">${track.duration || '0:00'}</div>
                `;
                burnListBody.appendChild(item);
            });
        }
    }
};

window.showMediaLibrary = function() {
    window.activeView = 'media-library';
    
    document.querySelector('.wmp9-window').classList.remove('media-guide-mode');
    document.querySelector('.wmp9-window').classList.remove('copy-cd-mode'); 
    document.querySelector('.wmp9-window').classList.remove('copy-to-cd-mode');
    document.querySelector('.wmp9-window').classList.remove('radio-tuner-mode');
    document.querySelector('.wmp9-window').classList.remove('premium-services-mode');
    document.querySelector('.wmp9-window').classList.remove('chooser-mode');
    document.querySelector('.wmp9-window').classList.add('media-library-mode');
    
    document.querySelectorAll('.wmp9-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        let caret = btn.querySelector('.wmp9-nav-caret');
        if(caret) caret.remove();
    });
    const mlBtn = document.getElementById('nav-media-library');
    if(mlBtn) {
        mlBtn.classList.add('active');
        mlBtn.innerHTML += '<div class="wmp9-nav-caret"></div>';
    }
    
    const centerPane = document.getElementById('playlist-drop-zone');
    if (centerPane) {
        centerPane.classList.remove('media-guide-active');
        centerPane.classList.remove('copy-cd-active');
        centerPane.classList.remove('copy-to-cd-active');
        centerPane.classList.remove('radio-tuner-active');
        centerPane.classList.remove('premium-services-active');
        centerPane.classList.remove('skin-chooser-active');
        centerPane.classList.add('media-library-active');
    }
    renderPlaylist(); 
};

window.showRadioTuner = function() {
    window.activeView = 'radio-tuner';
    
    document.querySelector('.wmp9-window').classList.remove('media-guide-mode');
    document.querySelector('.wmp9-window').classList.remove('copy-cd-mode'); 
    document.querySelector('.wmp9-window').classList.remove('copy-to-cd-mode');
    document.querySelector('.wmp9-window').classList.remove('media-library-mode');
    document.querySelector('.wmp9-window').classList.remove('premium-services-mode');
    document.querySelector('.wmp9-window').classList.remove('chooser-mode');
    document.querySelector('.wmp9-window').classList.add('radio-tuner-mode');
    
    document.querySelectorAll('.wmp9-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        let caret = btn.querySelector('.wmp9-nav-caret');
        if(caret) caret.remove();
    });
    const rtBtn = document.getElementById('nav-radio-tuner');
    if(rtBtn) {
        rtBtn.classList.add('active');
        rtBtn.innerHTML += '<div class="wmp9-nav-caret"></div>';
    }
    
    const centerPane = document.getElementById('playlist-drop-zone');
    if (centerPane) {
        centerPane.classList.remove('media-guide-active');
        centerPane.classList.remove('copy-cd-active');
        centerPane.classList.remove('copy-to-cd-active');
        centerPane.classList.remove('media-library-active');
        centerPane.classList.remove('premium-services-active');
        centerPane.classList.remove('skin-chooser-active');
        centerPane.classList.add('radio-tuner-active');
    }
};

window.showPremiumServices = function() {
    window.activeView = 'premium-services';
    
    document.querySelector('.wmp9-window').classList.remove('media-guide-mode');
    document.querySelector('.wmp9-window').classList.remove('copy-cd-mode'); 
    document.querySelector('.wmp9-window').classList.remove('copy-to-cd-mode');
    document.querySelector('.wmp9-window').classList.remove('media-library-mode');
    document.querySelector('.wmp9-window').classList.remove('radio-tuner-mode');
    document.querySelector('.wmp9-window').classList.remove('chooser-mode');
    document.querySelector('.wmp9-window').classList.add('premium-services-mode');
    
    document.querySelectorAll('.wmp9-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        let caret = btn.querySelector('.wmp9-nav-caret');
        if(caret) caret.remove();
    });
    const psBtn = document.getElementById('nav-premium-services');
    if(psBtn) {
        psBtn.classList.add('active');
        psBtn.innerHTML += '<div class="wmp9-nav-caret"></div>';
    }
    
    const centerPane = document.getElementById('playlist-drop-zone');
    if (centerPane) {
        centerPane.classList.remove('media-guide-active');
        centerPane.classList.remove('copy-cd-active');
        centerPane.classList.remove('copy-to-cd-active');
        centerPane.classList.remove('media-library-active');
        centerPane.classList.remove('radio-tuner-active');
        centerPane.classList.remove('skin-chooser-active');
        centerPane.classList.add('premium-services-active');
    }
    
    window.switchPremiumService('home', document.querySelector('.ps-service-item'));
    logSystem("Premium Services");
};

window.showSkinChooser = function() {
    window.activeView = 'skin-chooser';
    
    document.querySelector('.wmp9-window').classList.remove('media-guide-mode');
    document.querySelector('.wmp9-window').classList.remove('copy-cd-mode'); 
    document.querySelector('.wmp9-window').classList.remove('copy-to-cd-mode');
    document.querySelector('.wmp9-window').classList.remove('media-library-mode');
    document.querySelector('.wmp9-window').classList.remove('radio-tuner-mode');
    document.querySelector('.wmp9-window').classList.remove('premium-services-mode');
    document.querySelector('.wmp9-window').classList.add('chooser-mode'); 
    
    document.querySelectorAll('.wmp9-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        let caret = btn.querySelector('.wmp9-nav-caret');
        if(caret) caret.remove();
    });
    const scBtn = document.getElementById('nav-skin-chooser');
    if(scBtn) {
        scBtn.classList.add('active');
        scBtn.innerHTML += '<div class="wmp9-nav-caret"></div>';
    }
    
    const centerPane = document.getElementById('playlist-drop-zone');
    if (centerPane) {
        centerPane.classList.remove('media-guide-active');
        centerPane.classList.remove('copy-cd-active');
        centerPane.classList.remove('copy-to-cd-active');
        centerPane.classList.remove('media-library-active');
        centerPane.classList.remove('radio-tuner-active');
        centerPane.classList.remove('premium-services-active');
        centerPane.classList.add('skin-chooser-active');
    }
    logSystem("Skin Chooser");
};

window.mgBack = function() {
    const frame = document.getElementById('media-guide-frame');
    if(frame && frame.contentWindow) {
        try { frame.contentWindow.history.back(); } catch(e){}
    }
};

window.mgForward = function() {
    const frame = document.getElementById('media-guide-frame');
    if(frame && frame.contentWindow) {
        try { frame.contentWindow.history.forward(); } catch(e){}
    }
};

window.mgStop = function() {
    const spinner = document.getElementById('mg-spinner');
    if(spinner) spinner.style.display = 'none';
    const frame = document.getElementById('media-guide-frame');
    if(frame) {
        try { frame.contentWindow.stop(); } catch(e){}
        frame.style.opacity = '1';
    }
};

window.mgRefresh = function() {
    const frame = document.getElementById('media-guide-frame');
    if(frame) {
        frame.removeAttribute('data-loaded');
        window.showMediaGuide(); 
    }
};

window.mgHome = function() {
    const frame = document.getElementById('media-guide-frame');
    if(frame) {
        frame.removeAttribute('data-loaded');
        window.showMediaGuide(); 
    }
};

window.cdReload = function() {
    logSystem("Reading disc...");
    setTimeout(() => logSystem("No Disk (D:\\)"), 1500);
};

window.cdEject = function() {
    logSystem("Ejecting disc...");
    setTimeout(() => logSystem("Ready"), 1500);
};

window.mlNewPlaylist = function() {
    logSystem("New Playlist...");
    setTimeout(() => logSystem("Ready"), 1500);
};

window.mlAddToPlaylist = function() {
    logSystem("Add to playlist...");
    setTimeout(() => logSystem("Ready"), 1500);
};

window.mlSearch = function() {
    logSystem("Searching...");
    setTimeout(() => logSystem("Ready"), 1500);
};

window.mlMediaDetails = function() {
    if (currentTrackIndex === -1 || !playlist[currentTrackIndex]) {
        openDialog('error-dialog');
    } else {
        logSystem("Loading Media Details...");
        const track = playlist[currentTrackIndex];
        let query = track.album || track.title || (track.file ? track.file.name.replace(/\.[^/.]+$/, "") : 'Windows Media Player');
        if (track.folder && track.folder !== "Library" && track.folder !== "Network" && track.folder !== "Devices") {
            query = track.folder + ' ' + query;
        }
        window.open(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`, '_blank');
        setTimeout(() => logSystem("Ready"), 1500);
    }
};

/* --- METADATA & ALBUM ART --- */
let currentBlobUrl = null;

function fetchFallbackArtwork(query, plAlbumArt, centerArt) {
    if (!query) return;
    fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=1`)
        .then(res => res.json())
        .then(data => {
            if (data.results && data.results.length > 0 && data.results[0].artworkUrl100) {
                let artUrl = data.results[0].artworkUrl100.replace('100x100bb', '500x500bb');
                
                if (plAlbumArt) {
                    plAlbumArt.innerHTML = '';
                    plAlbumArt.style.backgroundImage = `url('${artUrl}')`;
                    plAlbumArt.style.backgroundSize = 'cover';
                    plAlbumArt.style.backgroundPosition = 'center';
                }
                
                if (centerArt && mainPlayer.style.display === 'none' && !ytActive) {
                    centerArt.src = artUrl;
                    if (window.activeVisMode === 'art') {
                        centerArt.style.display = 'block';
                    }
                }
            } else {
                if (centerArt) centerArt.src = 'https://proxy.duckduckgo.com/iu/?u=https://i.imgur.com/bGIU6HJ.png';
            }
        })
        .catch(err => {
            console.log('Fallback artwork search failed', err);
            if (centerArt) centerArt.src = 'https://proxy.duckduckgo.com/iu/?u=https://i.imgur.com/bGIU6HJ.png';
        });
}

function extractMetadata(track) {
    const albumLink = document.getElementById('wmp9-album-link');
    const plAlbumArt = document.getElementById('wmp9-playlist-album-art');
    const centerArt = document.getElementById('album-art');
    
    if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
        currentBlobUrl = null;
    }

    if (track.isYouTube) {
        if (albumLink) {
            albumLink.innerText = 'Find YouTube Info';
            albumLink.onclick = () => window.open(track.url, '_blank');
        }
        if (plAlbumArt) {
            if (track.thumb) {
                plAlbumArt.innerHTML = '';
                plAlbumArt.style.backgroundImage = `url('${track.thumb}')`;
                plAlbumArt.style.backgroundSize = 'cover';
                plAlbumArt.style.backgroundPosition = 'center';
            } else {
                plAlbumArt.style.backgroundImage = 'linear-gradient(to bottom, #748dc7, #39508d)';
                plAlbumArt.innerHTML = '<i class="ph-fill ph-music-notes"></i>';
            }
        }
        if (centerArt) {
            centerArt.src = '';
        }
        return; 
    }
    
    if (albumLink) {
        albumLink.innerText = 'Find Album Info';
        albumLink.onclick = () => {
            const query = track.file ? track.file.name : 'Windows Media Player';
            window.open(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`, '_blank');
        };
    }
    if (plAlbumArt) {
        plAlbumArt.style.backgroundImage = 'linear-gradient(to bottom, #748dc7, #39508d)';
        plAlbumArt.innerHTML = '<i class="ph-fill ph-music-notes"></i>';
    }
    
    if (centerArt) {
        centerArt.src = 'https://proxy.duckduckgo.com/iu/?u=https://i.imgur.com/bGIU6HJ.png';
    }
    
    let cleanFileName = track.file ? track.file.name.replace(/\.[^/.]+$/, "") : 'unknown';

    if (!track.file || !window.jsmediatags || track.file.size === undefined) {
        fetchFallbackArtwork(cleanFileName, plAlbumArt, centerArt);
        return;
    }

    window.jsmediatags.read(track.file, {
        onSuccess: function(tag) {
            const tags = tag.tags;
            
            if (tags.album && albumLink) {
                albumLink.innerText = tags.album;
                let query = tags.album;
                if (tags.artist) query = tags.artist + ' ' + query;
                albumLink.onclick = () => window.open(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`, '_blank');
                track.album = tags.album; 
            }

            if (tags.artist) {
                const vArtist = document.getElementById('video-artist') || document.getElementById('wmp9-video-artist'); 
                if(vArtist) vArtist.innerText = tags.artist; 
                track.folder = tags.artist; 
            }

            if (tags.title) {
                const vTitle = document.getElementById('video-title') || document.getElementById('wmp9-video-title');
                const plName = document.getElementById('track-name') || document.getElementById('wmp9-playlist-track-name');
                if(vTitle) vTitle.innerText = tags.title;
                if(plName) plName.innerText = tags.title;
                
                track.title = tags.title; 
                
                const activeTrackText = document.querySelector('.track-item.active .track-info-text');
                if (activeTrackText) activeTrackText.innerText = `${tags.artist ? tags.artist + ' - ' : ''}${tags.title}`;
            }

            let fallbackQuery = (tags.artist ? tags.artist + ' ' : '') + (tags.album || tags.title || cleanFileName);

            if (tags.picture) {
                const data = tags.picture.data;
                const format = tags.picture.format;
                const byteArray = new Uint8Array(data);
                const blob = new Blob([byteArray], { type: format });
                currentBlobUrl = URL.createObjectURL(blob);
                
                if (plAlbumArt) {
                    plAlbumArt.innerHTML = '';
                    plAlbumArt.style.backgroundImage = `url('${currentBlobUrl}')`;
                    plAlbumArt.style.backgroundSize = 'cover';
                    plAlbumArt.style.backgroundPosition = 'center';
                }
                
                if (centerArt && mainPlayer.style.display === 'none' && !ytActive) {
                    centerArt.src = currentBlobUrl;
                    if (window.activeVisMode === 'art') {
                        centerArt.style.display = 'block';
                    }
                }
            } else {
                fetchFallbackArtwork(fallbackQuery, plAlbumArt, centerArt);
            }
        },
        onError: function(error) {
            console.log('No ID3 tags found or error reading tags.');
            fetchFallbackArtwork(cleanFileName, plAlbumArt, centerArt);
        }
    });
}

/* --- ASPECT RATIO CONTROLS --- */
window.currentAspectRatio = 'default';

window.setAspectRatio = function(ratio) {
    window.currentAspectRatio = ratio;
    
    const items = document.querySelectorAll('#aspectRatioList .dropdown-item, #vlc-context-menu .context-nested .context-item');
    if (items) {
        items.forEach(item => item.classList.remove('active-state'));
        const clickedItems = Array.from(items).filter(item => item.innerText.trim().toLowerCase() === ratio.toLowerCase());
        clickedItems.forEach(item => item.classList.add('active-state'));
    }
    if (ratio === 'default') {
        logSystem("Video Size: Fit to Window");
    } else {
        logSystem(`Video Size: ${ratio}`);
    }
    window.applyAspectRatio();
};

window.toggleAspectRatio = function() {
    const ratios = ['default', '16:9', '16:10', '4:3', '1:1', '2.35:1'];
    let nextIdx = (ratios.indexOf(window.currentAspectRatio) + 1) % ratios.length;
    window.setAspectRatio(ratios[nextIdx]);
};

window.applyAspectRatio = function() {
    const container = document.getElementById('playlist-drop-zone');
    if (!container) return;
    
    if (window.currentAspectRatio === 'default' || window.currentAspectRatio === 'Fit to Window') {
        if (mainPlayer) { 
            mainPlayer.style.width = '100%'; 
            mainPlayer.style.height = '100%'; 
            mainPlayer.style.objectFit = 'contain'; 
        }
        if (ytPlayer) { 
            ytPlayer.style.width = '100%'; 
            ytPlayer.style.height = '100%'; 
        }
        if (albumArt) { 
            albumArt.style.width = 'auto'; 
            albumArt.style.height = '100%'; 
            albumArt.style.maxWidth = '100%'; 
            albumArt.style.objectFit = 'contain'; 
        }
        if (visualizer) {
            visualizer.style.width = '100%';
            visualizer.style.height = '100%';
        }
        return;
    }
    
    let ratioParts = window.currentAspectRatio.split(':');
    let targetRatio = parseFloat(ratioParts[0]) / parseFloat(ratioParts[1]);
    let cWidth = container.clientWidth; 
    let cHeight = container.clientHeight; 
    let cRatio = cWidth / cHeight;
    
    let finalWidth, finalHeight;
    if (targetRatio > cRatio) { 
        finalWidth = cWidth; 
        finalHeight = cWidth / targetRatio; 
    } else { 
        finalHeight = cHeight; 
        finalWidth = cHeight * targetRatio; 
    }
    
    if (mainPlayer) { 
        mainPlayer.style.width = finalWidth + 'px'; 
        mainPlayer.style.height = finalHeight + 'px'; 
        mainPlayer.style.objectFit = 'fill'; 
    }
    if (ytPlayer) { 
        ytPlayer.style.width = finalWidth + 'px'; 
        ytPlayer.style.height = finalHeight + 'px'; 
    }
    if (albumArt) { 
        albumArt.style.width = finalWidth + 'px'; 
        albumArt.style.height = finalHeight + 'px'; 
        albumArt.style.objectFit = 'fill'; 
        albumArt.style.maxWidth = 'none'; 
    }
    if (visualizer) {
        visualizer.style.width = finalWidth + 'px';
        visualizer.style.height = finalHeight + 'px';
    }
};

window.addEventListener('resize', () => { 
    if (window.currentAspectRatio !== 'default') window.applyAspectRatio(); 
});

/* --- VIDEO FILTERS --- */
let appState = JSON.parse(localStorage.getItem('vlc_web_state')) || { 
    theme: '#00ffff', 
    eqGains: Array(10).fill(0), 
    spatialEnabled: false 
};

appState.videoFilters = { brightness: 100, contrast: 100, saturation: 100, hue: 0, sepia: 0 };

if (!appState.eqGains || appState.eqGains.length < 10) {
    appState.eqGains = Array(10).fill(0);
}

function saveConfig() { 
    try { 
        localStorage.setItem('vlc_web_state', JSON.stringify(appState)); 
    } catch(e) {} 
}

window.updateVideoFilters = function() {
    appState.videoFilters = {
        brightness: parseFloat(document.getElementById('vfx-brightness').value),
        contrast: parseFloat(document.getElementById('vfx-contrast').value),
        saturation: parseFloat(document.getElementById('vfx-saturation').value),
        hue: parseFloat(document.getElementById('vfx-hue').value),
        sepia: parseFloat(document.getElementById('vfx-sepia').value)
    };
    saveConfig(); 
    window.applyVideoFilters();
};

window.applyVideoFilters = function() {
    const f = appState.videoFilters;
    const filterString = `brightness(${f.brightness / 100}) contrast(${f.contrast / 100}) saturate(${f.saturation / 100}) hue-rotate(${f.hue}deg) sepia(${f.sepia / 100})`;
    if (mainPlayer) mainPlayer.style.filter = filterString;
    if (ytPlayer) ytPlayer.style.filter = filterString;
    if (albumArt) albumArt.style.filter = filterString;
    if (visualizer) visualizer.style.filter = filterString;
};

window.syncVideoFiltersUI = function() {
    const f = appState.videoFilters;
    if(document.getElementById('vfx-brightness')) {
        document.getElementById('vfx-brightness').value = f.brightness !== undefined ? f.brightness : 100;
        document.getElementById('vfx-contrast').value = f.contrast !== undefined ? f.contrast : 100;
        document.getElementById('vfx-saturation').value = f.saturation !== undefined ? f.saturation : 100;
        document.getElementById('vfx-hue').value = f.hue !== undefined ? f.hue : 0;
        document.getElementById('vfx-sepia').value = f.sepia !== undefined ? f.sepia : 0;
    }
};

window.resetVideoFilters = function() {
    appState.videoFilters = { brightness: 100, contrast: 100, saturation: 100, hue: 0, sepia: 0 };
    window.syncVideoFiltersUI(); 
    window.applyVideoFilters(); 
    logSystem("Video settings reset.");
};

window.syncVideoFiltersUI(); 
window.applyVideoFilters();

let fxPresetIdx = 0;

window.setArtFilter = function(idx) {
    fxPresetIdx = idx;
    let b=100, c=100, s=100, h=0, sep=0;
    if (idx === 1) { 
        s = 0; 
        logSystem("Overlays: Grayscale");
    } else if (idx === 2) { 
        c = 180; 
        logSystem("Overlays: High Contrast");
    } else if (idx === 3) { 
        sep = 100; 
        logSystem("Overlays: Sepia");
    } else if (idx === 4) { 
        h = 180; 
        s = 200; 
        logSystem("Overlays: Trippy");
    } else { 
        logSystem("Overlays: Normal"); 
    }
    
    appState.videoFilters = { brightness: b, contrast: c, saturation: s, hue: h, sepia: sep };
    window.syncVideoFiltersUI(); 
    window.applyVideoFilters();

    const overlayItems = document.querySelectorAll('#overlayMenuList .dropdown-item');
    if (overlayItems.length > 0) {
        overlayItems.forEach(item => item.classList.remove('active-state'));
        if (overlayItems[idx]) overlayItems[idx].classList.add('active-state');
    }
};

window.cycleArtFilter = function() {
    let nextIdx = (fxPresetIdx + 1) % 5;
    window.setArtFilter(nextIdx);
};

/* --- EQUALIZER UI --- */
function buildEQUI() {
    const freqs = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
    const container = document.getElementById('eq-sliders');
    if(!container) return;
    
    container.innerHTML = '';
    freqs.forEach((freq, i) => {
        const label = freq >= 1000 ? (freq/1000)+'k' : freq;
        const div = document.createElement('div');
        div.className = 'eq-band';
        const val = appState.eqGains[i] || 0;
        div.innerHTML = `<input type="range" class="vert-slider" orient="vertical" min="-12" max="12" value="${val}" oninput="window.updateEQ(${i}, this.value)"><label>${label}</label>`;
        container.appendChild(div);
    });
}
buildEQUI();

/* --- FORMAT DISPLAY TOGGLE --- */
let showingFormat = false;
window.toggleFormatDisplay = function() {
    showingFormat = !showingFormat;
    const formatBtn = document.getElementById('format-toggle-btn');
    if(formatBtn) {
        if (showingFormat) formatBtn.classList.add('active-state');
        else formatBtn.classList.remove('active-state');
    }
};

/* --- NETWORK STREAMING --- */
document.addEventListener('paste', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    const pasteText = (e.clipboardData || window.clipboardData).getData('text');
    if (pasteText && pasteText.startsWith('http')) { 
        e.preventDefault(); 
        handleNetworkStream(pasteText); 
    }
});

window.promptNetworkStream = function() {
    openDialog('stream-dialog');
    setTimeout(() => { 
        const input = document.getElementById('stream-url-input'); 
        if(input) { 
            input.focus(); 
            input.select(); 
        } 
    }, 50);
}

window.submitNetworkStream = function() {
    const url = document.getElementById('stream-url-input').value.trim();
    if (url && url.startsWith('http')) { 
        handleNetworkStream(url); 
        closeDialog('stream-dialog'); 
        document.getElementById('stream-url-input').value = ''; 
    } else { 
        logSystem("Invalid URL", "error"); 
    }
}

document.getElementById('stream-url-input').addEventListener('keydown', (e) => { 
    if (e.key === 'Enter') { 
        e.preventDefault(); 
        window.submitNetworkStream(); 
    } 
});

function handleNetworkStream(url, forcePlay = false, customTitle = null, streamSpeed = null) {
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    let defaultName = customTitle || url.split('/').pop() || 'Network Stream';
    
    if (ytMatch && ytMatch[1]) {
        let ytId = ytMatch[1];
        let newIndex = playlist.length;
        playlist.push({ file: { name: customTitle || 'YouTube Stream' }, url: url, isYouTube: true, ytId: ytId, duration: 'Live', folder: 'Network', speed: streamSpeed });
        logSystem("YouTube stream added.");
        renderPlaylist();
        if (forcePlay || currentTrackIndex === -1 || mainPlayer.paused) loadTrack(playlist.length - 1);
        scrollToBottom();

        fetch('https://noembed.com/embed?url=' + encodeURIComponent(url))
            .then(res => res.json())
            .then(data => {
                if (data.title) {
                    playlist[newIndex].file.name = data.title;
                    playlist[newIndex].title = data.title;
                    if (data.thumbnail_url) playlist[newIndex].thumb = data.thumbnail_url;

                    renderPlaylist();
                    if (currentTrackIndex === newIndex) {
                        extractMetadata(playlist[newIndex]);
                        const vTitle = document.getElementById('video-title') || document.getElementById('wmp9-video-title');
                        const plName = document.getElementById('track-name') || document.getElementById('wmp9-playlist-track-name');
                        if(vTitle) vTitle.innerText = data.title;
                        if(plName) plName.innerText = data.title;
                    }
                }
            })
            .catch(e => console.error("YT Meta Error:", e));
    } else if (url.toLowerCase().endsWith('.m3u') || url.toLowerCase().endsWith('.pls')) {
        logSystem("Parsing playlist...");
        raceProxies(url).then(content => {
            const lines = content.split(/\r?\n/);
            let found = false;
            for (let line of lines) {
                line = line.trim();
                let streamUrl = line;
                if ((url.toLowerCase().endsWith('.pls') || url.toLowerCase().endsWith('.m3u')) && line.toLowerCase().startsWith('file')) {
                    const eq = line.indexOf('=');
                    if (eq > -1) streamUrl = line.substring(eq + 1).trim();
                }
                if (streamUrl && !streamUrl.startsWith('#') && streamUrl.startsWith('http')) {
                    playlist.push({ file: { name: defaultName }, url: streamUrl, duration: 'Live', folder: 'Network', speed: streamSpeed });
                    found = true;
                    break;
                }
            }
            if(found) {
                renderPlaylist();
                if (forcePlay || currentTrackIndex === -1 || mainPlayer.paused) loadTrack(playlist.length - 1);
                logSystem("Stream added.");
                scrollToBottom();
            } else {
                throw new Error("No stream found");
            }
        }).catch(e => {
            playlist.push({ file: { name: defaultName }, url: url, duration: 'Live', folder: 'Network', speed: streamSpeed });
            renderPlaylist();
            if (forcePlay || currentTrackIndex === -1 || mainPlayer.paused) loadTrack(playlist.length - 1);
            scrollToBottom();
        });
    } else {
        playlist.push({ file: { name: defaultName }, url: url, duration: '--:--', folder: 'Network', speed: streamSpeed });
        logSystem("Network stream added.");
        renderPlaylist();
        if (forcePlay || currentTrackIndex === -1 || mainPlayer.paused) loadTrack(playlist.length - 1);
        scrollToBottom();
    }
}

/* --- CAPTURE DEVICE --- */
window.openCaptureDevice = async function() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        playlist.push({ file: { name: 'Live Capture Device' }, url: '', isStream: true, stream: stream, duration: 'Live', folder: 'Devices' });
        logSystem("Capture device added."); 
        renderPlaylist();
        if (currentTrackIndex === -1 || mainPlayer.paused) loadTrack(playlist.length - 1);
        scrollToBottom();
    } catch (err) { 
        logSystem("Mic Access Denied.", "error"); 
    }
};

/* --- LOCAL FILE HANDLING --- */
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    document.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
    }, false);
});

document.addEventListener('drop', (e) => { 
    const dz = document.getElementById('playlist-drop-zone');
    if (dz) dz.classList.remove('dragover'); 
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        window.processFiles(e.dataTransfer.files); 
    }
});

const dzElement = document.getElementById('playlist-drop-zone');
if (dzElement) {
    dzElement.addEventListener('dragover', (e) => { 
        dzElement.classList.add('dragover'); 
    });
    dzElement.addEventListener('dragleave', (e) => { 
        dzElement.classList.remove('dragover'); 
    });        
}

window.processFiles = async function(fileList) {
    try {
        const files = Array.from(fileList);
        const blockedExts = ['.avi', '.wmv', '.flv', '.rm', '.vob', '.mts', '.m2ts']; 
        const allowedAudioVideo = ['.mp4', '.webm', '.ogg', '.mp3', '.wav', '.flac', '.aac', '.m4a', '.m3u8'];
        let addedCount = 0;

        for (let file of files) {
            let ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            if (blockedExts.includes(ext)) continue;

            // Handle MKV specifically via Single-Threaded FFmpeg.wasm
            if (ext === '.mkv') {
                
                // NEW: CodePen Security Check
                if (window.location.hostname.includes('cdpn.io') || window.location.hostname.includes('codepen.io')) {
                    openDialog('codepen-mkv-dialog');
                    continue; // Skip processing this MKV file
                }

                if (window.convertMKV) {
                    logSystem("Remuxing MKV format... this may take a moment.");
                    const spinner = document.getElementById('mg-spinner');
                    if (spinner) spinner.style.display = 'block';

                    try {
                        file = await window.convertMKV(file);
                        ext = '.mp4'; 
                    } catch (err) {
                        console.error("FFmpeg Error:", err);
                        logSystem("Error processing MKV.", "error");
                        if (spinner) spinner.style.display = 'none';
                        continue;
                    }

                    if (spinner) spinner.style.display = 'none';
                    logSystem("Ready");
                } else {
                    logSystem("ERROR: FFmpeg engine missing. Press F12 to check console.", "error");
                    continue;
                }
            }
            
            if (ext === '.m3u' || ext === '.pls' || ext === '.m3u8') {
                await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const lines = e.target.result.split(/\r?\n/);
                        let added = false;
                        for (let line of lines) {
                            line = line.trim();
                            let streamUrl = line;
                            if ((ext === '.pls' || ext === '.m3u' || ext === '.m3u8') && line.toLowerCase().startsWith('file')) {
                                const eq = line.indexOf('=');
                                if (eq > -1) streamUrl = line.substring(eq + 1).trim();
                            }
                            if (streamUrl && !streamUrl.startsWith('#') && streamUrl.startsWith('http')) {
                                playlist.push({ file: { name: file.name.replace(/\.[^/.]+$/, "") + ' Stream' }, url: streamUrl, duration: 'Live', folder: 'Network' });
                                added = true;
                                break; 
                            }
                        }
                        if(added) {
                            renderPlaylist();
                            if (currentTrackIndex === -1 || mainPlayer.paused) loadTrack(playlist.length - 1);
                            logSystem(`Loaded stream from ${file.name}`);
                            scrollToBottom();
                        } else {
                            logSystem("No stream found in playlist.", "error");
                        }
                        resolve();
                    };
                    reader.readAsText(file);
                });
                continue; 
            }
            
            if (file.type.startsWith('audio/') || file.type.startsWith('video/') || allowedAudioVideo.includes(ext)) {
                if (playlist.length < MAX_PLAYLIST_SIZE) {
                    playlist.push({ file: file, url: URL.createObjectURL(file), duration: '--:--', folder: 'Library' });
                    addedCount++;
                }
            }
        }
        
        if (addedCount > 0) { 
            renderPlaylist(); 
            logSystem(`Added ${addedCount} file(s).`); 
            if (currentTrackIndex === -1) loadTrack(0); 
            scrollToBottom();
        } else if (files.length > 0 && addedCount === 0 && !files[0].name.match(/\.(m3u|m3u8|pls|mkv)$/i)) { 
            logSystem("No valid files found.", "error"); 
        }
    } catch (err) {
        console.error(err);
    }
};

document.getElementById('media-input').addEventListener('change', (e) => { 
    if(e.target.files && e.target.files.length > 0) window.processFiles(e.target.files); 
    e.target.value = '';
});

/* --- SUBTITLES & CAPTIONS --- */
function srtToVtt(srtText) {
    let vtt = "WEBVTT\n\n"; 
    vtt += srtText.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2'); 
    return vtt;
}

function loadExternalSubtitle(file) {
    try {
        const reader = new FileReader();
        reader.onload = function(e) {
            const vttText = srtToVtt(e.target.result); 
            const vttBlob = new Blob([vttText], { type: 'text/vtt' }); 
            const vttUrl = URL.createObjectURL(vttBlob);
            
            const oldTracks = mainPlayer.querySelectorAll('track'); 
            oldTracks.forEach(t => t.remove());
            
            const newTrack = document.createElement('track'); 
            newTrack.kind = 'subtitles'; 
            newTrack.srclang = 'en'; 
            newTrack.label = file.name; 
            newTrack.src = vttUrl; 
            newTrack.default = true;
            mainPlayer.appendChild(newTrack);
            
            setTimeout(() => { 
                updateSubtitleTrackMenu(); 
                if (mainPlayer.textTracks.length > 0) { 
                    mainPlayer.textTracks[mainPlayer.textTracks.length - 1].mode = 'showing'; 
                    updateSubtitleTrackMenu(); 
                } 
            }, 150);
            logSystem(`Loaded captions: ${file.name}`);
        };
        reader.readAsText(file);
    } catch (err) {}
}

document.getElementById('sub-input').addEventListener('change', (e) => { 
    if(e.target.files[0]) { 
        loadExternalSubtitle(e.target.files[0]); 
        e.target.value = ''; 
    } 
});

function updateSubtitleTrackMenu() {
    subtitleTracks = Array.from(mainPlayer.textTracks);
    const subTrackParent = document.getElementById('subTrackParent');
    const subTrackList = document.getElementById('subTrackList');
    
    if (!subTrackParent || !subTrackList) return;
    
    const parentHasDisabledClass = subTrackParent.classList.contains('disabled');
    let activeIdx = -1;
    
    subtitleTracks.forEach((t, i) => { 
        if(t.mode === 'showing') activeIdx = i; 
    });
    
    subTrackList.innerHTML = `<div class="dropdown-item ${activeIdx === -1 ? 'active-state' : ''}" onclick="setSubtitleTrack(-1)">Off</div>`;
    
    if (subtitleTracks.length > 0) {
        if (parentHasDisabledClass) subTrackParent.classList.remove('disabled');
        subtitleTracks.forEach((track, index) => {
            const item = document.createElement('div'); 
            item.className = `dropdown-item ${index === activeIdx ? 'active-state' : ''}`; 
            item.innerText = `${track.label || 'Track ' + (index + 1)}`; 
            item.onclick = () => setSubtitleTrack(index); 
            subTrackList.appendChild(item);
        });
    } else { 
        if (!parentHasDisabledClass) subTrackParent.classList.add('disabled'); 
    }
}

window.setSubtitleTrack = function(index) {
    subtitleTracks.forEach(t => t.mode = 'hidden');
    if (subtitleTracks[index]) subtitleTracks[index].mode = 'showing';
    updateSubtitleTrackMenu(); 
};

/* --- FULLSCREEN & PIP --- */
window.togglePiP = async function() {
    if (ytActive) return; 
    if (mainPlayer.style.display === 'none' || mainPlayer.readyState === 0) return;
    try { 
        if (mainPlayer !== document.pictureInPictureElement) {
            await mainPlayer.requestPictureInPicture(); 
        } else {
            await document.exitPictureInPicture(); 
        }
    } catch(e) {}
};

window.toggleFullscreen = function() {
    if (idleLogo.style.display !== 'none') return;
    try { 
        if (!document.fullscreenElement) {
            document.getElementById('playlist-drop-zone').requestFullscreen(); 
        } else {
            document.exitFullscreen(); 
        }
    } catch(e) {}
};

let hideFsTimeout;
function showFsBar() {
    if (!document.fullscreenElement) return;
    if (fsBar) fsBar.style.opacity = '1'; 
    if (dropZone) dropZone.style.cursor = 'default';
    
    clearTimeout(hideFsTimeout);
    hideFsTimeout = setTimeout(() => { 
        if (fsBar && (fsBar.matches(':hover') || fsDragActive)) { 
            showFsBar(); 
            return; 
        } 
        if (fsBar) fsBar.style.opacity = '0'; 
        if (dropZone) dropZone.style.cursor = 'none'; 
    }, 4000);
}

document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        if (fsBar) { 
            fsBar.style.display = 'flex'; 
            fsBar.style.transform = 'translateX(-50%)'; 
            fsBar.style.bottom = '25px'; 
            fsBar.style.left = '50%'; 
            fsBar.style.top = 'auto'; 
        }
        showFsBar(); 
        setTimeout(window.applyAspectRatio, 100);
    } else {
        if (fsBar) fsBar.style.display = 'none'; 
        if (dropZone) dropZone.style.cursor = 'default'; 
        setTimeout(window.applyAspectRatio, 100);
    }
});

const dzClick = document.getElementById('playlist-drop-zone');
if (dzClick) { 
    dzClick.addEventListener('dblclick', (e) => { 
        // Fix: Prevent bubbling double-clicks from UI tabs (like Skin Chooser) from triggering fullscreen
        if (e.target.closest('#skin-chooser-view') || 
            e.target.closest('#media-library-view') || 
            e.target.closest('#radio-tuner-view') || 
            e.target.closest('#copy-cd-view') || 
            e.target.closest('#copy-to-cd-view') || 
            e.target.closest('#premium-services-view') ||
            e.target.closest('#adv-controls')) {
            return;
        }

        if (window.activeView !== 'now-playing') return;
        if (e.target.closest('#fs-control-bar') || e.target.closest('.controls-wrapper') || e.target.closest('#reveal-right-btn')) return; 
        window.toggleFullscreen(); 
    }); 
}

/* --- PLAYLIST MANAGEMENT --- */
window.removeTrack = function(index, e) {
    if (e) e.stopPropagation(); 
    
    playlist.splice(index, 1);
    
    if (playlist.length === 0) { 
        window.stopTrack(); 
        currentTrackIndex = -1; 
    } 
    else if (index === currentTrackIndex) { 
        window.stopTrack(); 
        currentTrackIndex = -1; 
    } 
    else if (index < currentTrackIndex) { 
        currentTrackIndex--; 
    }
    
    renderPlaylist();
};

function renderPlaylist() {
    playlistList.innerHTML = '';
    
    const libraryList = document.getElementById('library-track-list');
    if (libraryList) {
        libraryList.innerHTML = '';
        if (playlist.length === 0) {
            libraryList.innerHTML = '<div class=\"ml-empty-text\" id=\"ml-empty-text\">Music and Video will appear here when detected.</div>';
        }
    }
    
    let wmpTotalTimeStr = "0:00";
    if (playlist.length > 0) wmpTotalTimeStr = playlist[playlist.length-1].duration; 
    const totalTimeEl = document.getElementById('total-time') || document.getElementById('wmp9-total-time');
    if (totalTimeEl) totalTimeEl.innerText = `Total Time: ${wmpTotalTimeStr}`;
    
    const npDropdownMenu = document.getElementById('now-playing-dropdown-menu');
    if (npDropdownMenu) npDropdownMenu.innerHTML = '';
    
    if (playlist.length === 0 && npDropdownMenu) {
        npDropdownMenu.innerHTML = '<div class="dropdown-item disabled"><div class="dropdown-item-text">Playlist is empty</div></div>';
    }
    
    playlist.forEach((track, i) => {
        const item = document.createElement('div');
        item.className = `track-item ${i === currentTrackIndex ? 'active' : ''}`;
        
        item.innerHTML = `
            <div class="track-info"><span class="track-info-text">${track.title ? track.title : track.file.name}</span></div>
            <div class="track-duration">${track.duration}</div>
            <div class="remove-track-btn" title="Remove" onclick="window.removeTrack(${i}, event)"><i class="ph-bold ph-x"></i></div>
        `;
        
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.remove-track-btn')) {
                document.querySelectorAll('.track-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
            }
        });
        
        item.addEventListener('dblclick', (e) => {
            if (!e.target.closest('.remove-track-btn')) {
                document.querySelectorAll('.track-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                loadTrack(i);
            }
        });
        
        playlistList.appendChild(item);
        
        if (libraryList) {
            const libItem = document.createElement('div');
            libItem.className = `ml-track-item ${i === currentTrackIndex ? 'active' : ''}`;
            
            const num = i + 1;
            const name = track.title || track.file.name || "Unknown";
            const artist = track.folder || "Unknown Artist";
            const album = track.album || "Unknown Album";
            
            libItem.innerHTML = `
                <div class="ml-col-num">${num}</div>
                <div class="ml-col-name">${name}</div>
                <div class="ml-col-artist">${artist}</div>
                <div class="ml-col-album">${album}</div>
            `;
            
            libItem.addEventListener('click', (e) => {
                document.querySelectorAll('.ml-track-item').forEach(el => el.classList.remove('active'));
                libItem.classList.add('active');
            });
            
            libItem.addEventListener('dblclick', (e) => {
                loadTrack(i);
            });
            
            libraryList.appendChild(libItem);
        }
        
        if (npDropdownMenu) {
            const dpItem = document.createElement('div');
            dpItem.className = 'dropdown-item';
            if (i === currentTrackIndex) {
                dpItem.style.fontWeight = 'bold';
                dpItem.style.background = '#e8edf4';
            }
            dpItem.innerHTML = `<div class="dropdown-item-text" style="width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><i class="ph-fill ${i === currentTrackIndex ? 'ph-play-circle' : 'ph-music-notes'} wmp9-menu-icon"></i>${track.title ? track.title : track.file.name}</div>`;
            dpItem.onclick = () => {
                loadTrack(i);
                document.querySelectorAll('.wmp9-floating-tab').forEach(el => el.classList.remove('open'));
                menuActive = false;
            };
            npDropdownMenu.appendChild(dpItem);
        }
    });
}

/* --- CORE PLAYBACK ENGINE --- */
function bindPlayerEvents() {
    mainPlayer.ontimeupdate = () => {
        if(mainPlayer.duration) {
            const pct = (mainPlayer.currentTime / mainPlayer.duration) * 100;
            
            progressBar.style.width = pct + '%';
            if(progressThumb) progressThumb.style.left = pct + '%';
            if (fsProgressBar) fsProgressBar.style.width = pct + '%';
            
            const timeStr = formatTime(mainPlayer.currentTime);
            document.querySelectorAll('#current-time, .wmp9-status-time').forEach(el => el.innerText = timeStr);
            
            if (document.getElementById('fs-current-time')) {
                document.getElementById('fs-current-time').innerText = timeStr;
            }
            
            const durStr = formatTime(mainPlayer.duration);
            if (document.getElementById('fs-combined-time')) {
                document.getElementById('fs-combined-time').innerText = `${timeStr} / ${durStr}`;
            }
        }
    };

    mainPlayer.onloadedmetadata = () => {
        const dur = formatTime(mainPlayer.duration);
        
        if (document.getElementById('fs-duration')) {
            document.getElementById('fs-duration').innerText = dur;
        }
        
        if (currentTrackIndex !== -1 && playlist[currentTrackIndex]) {
            let track = playlist[currentTrackIndex];
            let needsUpdate = false;

            if (track.duration === '--:--') {
                track.duration = dur;
                needsUpdate = true;
            }

            if (!track.speed && track.file && track.file.size && mainPlayer.duration > 0 && track.folder !== 'Network' && !track.isYouTube) {
                let kbps = Math.round((track.file.size * 8) / mainPlayer.duration / 1000);
                track.speed = kbps + 'K';
                needsUpdate = true;
            }

            if (needsUpdate) {
                renderPlaylist();
                if (!mainPlayer.paused) {
                    updatePlayIcon(true);
                }
            }
        }
        
        const totalTimeEl = document.getElementById('total-time') || document.getElementById('wmp9-total-time');
        if (totalTimeEl) totalTimeEl.innerText = `Total Time: ${dur}`;
        
        setTimeout(updateSubtitleTrackMenu, 150); 
    };

    mainPlayer.onerror = (e) => { 
        let err = mainPlayer.error; 
        if (!err || err.code === 0) return; 
        stopTrack(); 
    };

    mainPlayer.onended = () => {
        if (visualizer && typeof visualizer.pause === 'function') {
            visualizer.pause();
        }
        window.nextTrack();
    };

    /* VISUALIZER FIX: Safely lock visualizer play state to the main audio track */
    mainPlayer.addEventListener('play', () => {
        if (visualizer && visualizer.style.display === 'block') {
            if (typeof visualizer.play === 'function') {
                const vp = visualizer.play();
                if (vp !== undefined) vp.catch(()=>{});
            }
        }
    });

    mainPlayer.addEventListener('pause', () => {
        if (visualizer && visualizer.style.display === 'block') {
            if (typeof visualizer.pause === 'function') {
                visualizer.pause();
            }
        }
    });
}

bindPlayerEvents();

window.addEventListener('message', function(event) {
    if (event.origin !== 'https://www.youtube.com') return;
    try {
        let data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.event === 'infoDelivery' && data.info) {
            let info = data.info;

            if (info.duration && ytActive) {
                window.ytDuration = info.duration;
                const durStr = formatTime(info.duration);
                if (document.getElementById('fs-duration')) {
                    document.getElementById('fs-duration').innerText = durStr;
                }
                const totalTimeEl = document.getElementById('total-time') || document.getElementById('wmp9-total-time');
                if (totalTimeEl) totalTimeEl.innerText = `Total Time: ${durStr}`;

                if (currentTrackIndex !== -1 && playlist[currentTrackIndex] && playlist[currentTrackIndex].duration === 'Live') {
                    playlist[currentTrackIndex].duration = durStr;
                    renderPlaylist();
                }
            }

            if (info.playbackQuality && ytActive) {
                let q = info.playbackQuality;
                let res = "720p";
                if (q === 'tiny') res = '144p';
                else if (q === 'small') res = '240p';
                else if (q === 'medium') res = '360p';
                else if (q === 'large') res = '480p';
                else if (q === 'hd720') res = '720p';
                else if (q === 'hd1080') res = '1080p';
                else if (q === 'hd1440') res = '1440p';
                else if (q === 'hd2160') res = '2160p';
                else if (q === 'highres') res = '4K';
                else res = q;
                
                if (currentTrackIndex !== -1 && playlist[currentTrackIndex]) {
                    if (playlist[currentTrackIndex].speed !== res) {
                        playlist[currentTrackIndex].speed = res;
                        if (document.getElementById('wmp9-status-text')) {
                            updatePlayIcon(true);
                        }
                    }
                }
            }

            if (info.currentTime !== undefined && window.ytDuration && ytActive) {
                window.ytCurrentTime = info.currentTime;
                const pct = (info.currentTime / window.ytDuration) * 100;
                progressBar.style.width = pct + '%';
                if (progressThumb) progressThumb.style.left = pct + '%';
                if (fsProgressBar) fsProgressBar.style.width = pct + '%';

                const timeStr = formatTime(info.currentTime);
                document.querySelectorAll('#current-time, .wmp9-status-time').forEach(el => el.innerText = timeStr);
                if (document.getElementById('fs-current-time')) {
                    document.getElementById('fs-current-time').innerText = timeStr;
                }
                if (document.getElementById('fs-combined-time')) {
                    const durStr = formatTime(window.ytDuration);
                    document.getElementById('fs-combined-time').innerText = `${timeStr} / ${durStr}`;
                }
            }

            if (info.playerState !== undefined && ytActive) {
                if (info.playerState === 0) {
                    window.nextTrack();
                } else if (info.playerState === 1) {
                    updatePlayIcon(true);
                } else if (info.playerState === 2) {
                    updatePlayIcon(false);
                }
            }
        } else if (data.event === 'initialDelivery' && ytActive) {
            if(ytPlayer.contentWindow) ytPlayer.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1 }), '*');
        }
    } catch (e) {}
});

function loadTrack(index) {
    try {
        if (index < 0 || index >= playlist.length) return;
        currentTrackIndex = index; 
        const track = playlist[index];
        
        const vTitle = document.getElementById('video-title') || document.getElementById('wmp9-video-title'); 
        const vArtist = document.getElementById('video-artist') || document.getElementById('wmp9-video-artist'); 
        const plName = document.getElementById('track-name') || document.getElementById('wmp9-playlist-track-name');
        
        if(vTitle) vTitle.innerText = track.title ? track.title : track.file.name; 
        if(vArtist) vArtist.innerText = track.folder || "Library"; 
        if(plName) plName.innerText = track.title ? track.title : track.file.name;
        
        extractMetadata(track);
        
        idleLogo.style.display = 'none';

        if (track.isYouTube) {
            ytActive = true; 
            if (typeof updateCornerOverlay === 'function') updateCornerOverlay(true);
            mainPlayer.pause(); 
            mainPlayer.style.display = 'none'; 
            albumArt.style.display = 'none'; 
            if(visualizer) {
                visualizer.style.display = 'none';
                if (typeof visualizer.pause === 'function') visualizer.pause();
            }
            
            ytPlayer.style.display = 'block'; 
            ytPlayer.style.pointerEvents = 'none';
            ytPlayer.src = `https://www.youtube.com/embed/${track.ytId}?autoplay=1&enablejsapi=1&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0&iv_load_policy=3`;
            
            ytPlayer.onload = () => {
                if (ytActive && ytPlayer.contentWindow) {
                    ytPlayer.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1 }), '*');
                }
            };
            
            window.ytDuration = 0;
            window.ytCurrentTime = 0;

            window.applyVideoFilters(); 
            window.applyAspectRatio(); 
            renderPlaylist(); 
            updatePlayIcon(true); 
            return;
        }
        
        if (track.isStream) {
            ytActive = false; 
            if (typeof updateCornerOverlay === 'function') updateCornerOverlay(false);
            ytPlayer.style.display = 'none'; 
            ytPlayer.src = ''; 
            
            mainPlayer.pause(); 
            const oldTracks = mainPlayer.querySelectorAll('track'); 
            oldTracks.forEach(t => t.remove());

            mainPlayer.removeAttribute('src'); 
            mainPlayer.srcObject = track.stream; 
            mainPlayer.load(); 
            mainPlayer.style.display = 'block'; 
            albumArt.style.display = 'none';
            if(visualizer) {
                visualizer.style.display = 'none';
                if (typeof visualizer.pause === 'function') visualizer.pause();
            }
            
            window.applyVideoFilters(); 
            window.applyAspectRatio(); 
            renderPlaylist(); 
            playMedia(); 
            return;
        }

        ytActive = false; 
        if (typeof updateCornerOverlay === 'function') updateCornerOverlay(false);
        ytPlayer.style.display = 'none'; 
        ytPlayer.src = '';
        
        const isVideoFile = track.file && track.file.name ? track.file.name.toLowerCase().match(/\.(mp4|webm|ogg|m4v|mov)$/) : (track.file && track.file.type && track.file.type.startsWith('video'));
        const isVideoUrl = typeof track.url === 'string' && track.url.match(/\.(mp4)$/i);
        const isVideo = isVideoFile || isVideoUrl;
        
        mainPlayer.pause(); 
        mainPlayer.removeAttribute('src'); 
        mainPlayer.srcObject = null; 
        mainPlayer.load();
        
        const oldTracks = mainPlayer.querySelectorAll('track'); 
        oldTracks.forEach(t => t.remove());

        if (window.hlsInstance) {
            window.hlsInstance.destroy();
            window.hlsInstance = null;
        }

        if (track.folder === 'Network') {
            if (audioInitialized) {
                const newPlayer = mainPlayer.cloneNode(false);
                mainPlayer.parentNode.replaceChild(newPlayer, mainPlayer);
                mainPlayer = newPlayer;
                bindPlayerEvents();
                mainPlayer.volume = Math.min(currentVolPercent / 100, 1.0);
                
                if (audioCtx) {
                    audioCtx.close().catch(()=>{});
                    audioCtx = null;
                }
                audioInitialized = false;
                analyser = null;
                volumeGainNode = null;
                eqFilters = [];
                panner = null;
                audioSource = null;
            }
            mainPlayer.removeAttribute('crossorigin');
        } else {
            mainPlayer.setAttribute('crossorigin', 'anonymous');
        }

        const isM3U8 = (typeof track.url === 'string' && track.url.toLowerCase().includes('.m3u8')) || 
                       (track.file && track.file.name && track.file.name.toLowerCase().includes('.m3u8'));
                       
        let hlsWillPlay = false;

        if (isM3U8) {
            if (window.Hls && window.Hls.isSupported()) {
                window.hlsInstance = new window.Hls();
                window.hlsInstance.loadSource(track.url);
                window.hlsInstance.attachMedia(mainPlayer);
                hlsWillPlay = true;
                window.hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function() {
                    playMedia();
                });
                window.hlsInstance.on(window.Hls.Events.ERROR, function(event, data) {
                    if (data.fatal) {
                        switch (data.type) {
                            case window.Hls.ErrorTypes.NETWORK_ERROR:
                                window.hlsInstance.startLoad();
                                break;
                            case window.Hls.ErrorTypes.MEDIA_ERROR:
                                window.hlsInstance.recoverMediaError();
                                break;
                            default:
                                window.hlsInstance.destroy();
                                stopTrack();
                                logSystem("Stream Error", "error");
                                break;
                        }
                    }
                });
            } else if (mainPlayer.canPlayType('application/vnd.apple.mpegurl')) {
                mainPlayer.src = track.url;
            }
        } else {
            mainPlayer.src = track.url; 
            mainPlayer.load();
        }

        if (isVideo) { 
            mainPlayer.style.display = 'block'; 
            albumArt.style.display = 'none'; 
            if(visualizer) {
                visualizer.style.display = 'none';
                if (typeof visualizer.pause === 'function') visualizer.pause();
            }
        } else { 
            mainPlayer.style.display = 'none'; 
            if (document.pictureInPictureElement) document.exitPictureInPicture().catch(()=>{}); 
            
            window.setVisualizationMode(window.activeVisMode);
        }

        window.applyVideoFilters(); 
        window.applyAspectRatio(); 
        renderPlaylist(); 
        
        if (!hlsWillPlay) {
            playMedia();
        }
    } catch (err) {
        console.error("loadTrack Error:", err);
    }
}

async function playMedia() {
    if (ytActive) { 
        ytPlayer.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*'); 
        updatePlayIcon(true); 
        return; 
    }
    
    try {
        await mainPlayer.play(); 
        
        updatePlayIcon(true);
        
        if (mainPlayer.getAttribute('crossorigin') === 'anonymous') {
            if (!audioInitialized) {
                initAudioChain(); 
            } else if (audioCtx && audioCtx.state === 'suspended') {
                await audioCtx.resume(); 
            }
        }

        // FIX: Ensure visualizer safely plays when main audio plays
        if (visualizer && visualizer.style.display === 'block') {
            if (typeof visualizer.play === 'function' && visualizer.paused) {
                const vp = visualizer.play();
                if (vp !== undefined) {
                    vp.catch(e => console.log(e));
                }
            }
        }
        
    } catch (err) { 
        updatePlayIcon(false); 
    }
}

/* --- BMO SKIN LOGIC --- */
window.triggerBmoActionError = function() {
    const bmoFace = document.querySelector('.bmo-face');
    if (bmoFace && document.querySelector('.wmp9-window') && document.querySelector('.wmp9-window').classList.contains('skin-bmo')) {
        bmoFace.src = 'https://proxy.duckduckgo.com/iu/?u=https://i.imgur.com/OKjQcaW.png';
        clearTimeout(window.bmoFaceTimeout);
        window.bmoFaceTimeout = setTimeout(() => {
            bmoFace.src = 'https://proxy.duckduckgo.com/iu/?u=https://i.imgur.com/XyKeIJB.png';
        }, 1500);
    }
};

window.togglePlay = function() {
    if(playlist.length === 0) { 
        window.triggerBmoActionError();
        document.getElementById('media-input').click(); 
        return; 
    }
    
    if (ytActive) {
        const isPlaying = document.querySelector('#play-pause-btn i').classList.contains('ph-pause');
        if (isPlaying) { 
            ytPlayer.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*'); 
            updatePlayIcon(false); 
        } else { 
            ytPlayer.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*'); 
            updatePlayIcon(true); 
        }
        return;
    }
    
    if (mainPlayer.paused) {
        if (idleLogo.style.display !== 'none' && currentTrackIndex !== -1) {
            loadTrack(currentTrackIndex); 
        } else {
            playMedia(); 
        }
    } else { 
        mainPlayer.pause(); 
        if(visualizer && visualizer.style.display === 'block') {
            if (typeof visualizer.pause === 'function') {
                visualizer.pause();
            }
        }
        updatePlayIcon(false); 
    }
}

window.stopTrack = function() {
    if (playlist.length === 0 || currentTrackIndex === -1) {
        window.triggerBmoActionError();
    }

    if (typeof updateCornerOverlay === 'function') updateCornerOverlay(false);
    if (window.hlsInstance) {
        window.hlsInstance.destroy();
        window.hlsInstance = null;
    }

    if (ytActive) { 
        ytPlayer.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*'); 
        ytPlayer.style.display = 'none'; 
        ytPlayer.src = ''; 
        ytActive = false; 
    } else { 
        mainPlayer.pause(); 
        mainPlayer.currentTime = 0; 
        
        if(visualizer) {
            if (typeof visualizer.pause === 'function') {
                visualizer.pause();
            }
            visualizer.style.display = 'none';
        }
    }
    
    updatePlayIcon(false); 
    if (window.activeView !== 'media-guide' && window.activeView !== 'copy-cd' && window.activeView !== 'copy-to-cd' && window.activeView !== 'media-library' && window.activeView !== 'radio-tuner' && window.activeView !== 'premium-services' && window.activeView !== 'chooser') {
        idleLogo.style.display = 'flex'; 
    }
    mainPlayer.style.display = 'none'; 
    albumArt.style.display = 'none';
    
    const vTitle = document.getElementById('video-title') || document.getElementById('wmp9-video-title'); 
    const vArtist = document.getElementById('video-artist') || document.getElementById('wmp9-video-artist'); 
    const plName = document.getElementById('track-name') || document.getElementById('wmp9-playlist-track-name');
    
    if(vTitle) vTitle.innerText = "Windows Media Player"; 
    if(vArtist) vArtist.innerText = "Ready"; 
    if(plName) plName.innerText = "Ready";
    
    const currTimeEl = document.getElementById('current-time');
    if (currTimeEl) currTimeEl.innerText = "00:00"; 
    
    if (fsProgressBar) document.getElementById('fs-current-time').innerText = "00:00";
    
    progressBar.style.width = '0%'; 
    if(progressThumb) progressThumb.style.left = '0%'; 
    if (fsProgressBar) fsProgressBar.style.width = '0%';
    
    updateSubtitleTrackMenu();
    
    const statusIcon = document.getElementById('wmp9-status-icon');
    const statusIconImg = document.getElementById('wmp9-status-icon-img');
    const visControls = document.getElementById('status-vis-controls');
    
    if (statusIcon) {
        statusIcon.className = 'ph-fill ph-stop wmp9-status-icon';
        statusIcon.style.display = 'block';
    }
    if (statusIconImg) statusIconImg.style.display = 'none';
    const bottomStatus = document.getElementById('wmp9-status-text');
    if (bottomStatus) bottomStatus.innerText = "Stopped";
    
    if (visControls) {
        visControls.style.opacity = '0.3';
        visControls.style.pointerEvents = 'none';
    }
}

let loopState = 0; // 0: Off, 1: All, 2: One
let isShuffle = false;

window.toggleLoop = function() { 
    loopState = (loopState + 1) % 3; 
    const btn = document.getElementById('loop-btn'); 
    const icon = document.getElementById('loop-icon-inner');
    
    if (btn && icon) {
        if (loopState === 0) {
            btn.classList.remove('active-state');
            icon.className = 'ph-bold ph-repeat';
            logSystem("Repeat: Off");
        } else if (loopState === 1) {
            btn.classList.add('active-state');
            icon.className = 'ph-bold ph-repeat';
            logSystem("Repeat: All");
        } else if (loopState === 2) {
            btn.classList.add('active-state');
            icon.className = 'ph-bold ph-repeat-once';
            logSystem("Repeat: One");
        }
    }
};

window.toggleShuffle = function() { 
    isShuffle = !isShuffle; 
    const btn = document.getElementById('shuffle-btn'); 
    if(isShuffle && btn) btn.classList.add('active-state'); 
    else if (btn) btn.classList.remove('active-state'); 
    
    logSystem(isShuffle ? "Shuffle: On" : "Shuffle: Off");
};

window.nextTrack = function() {
    if(playlist.length === 0) {
        window.triggerBmoActionError();
        return;
    }
    
    if (loopState === 2) {
        if (ytActive) {
            if (ytPlayer.contentWindow) {
                ytPlayer.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'seekTo', args: [0, true] }), '*');
                ytPlayer.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: "" }), '*');
            }
        } else {
            mainPlayer.currentTime = 0;
            playMedia();
        }
        return;
    }

    let next;
    if(isShuffle) { 
        next = Math.floor(Math.random() * playlist.length); 
        if(next === currentTrackIndex && playlist.length > 1) {
            next = (next + 1) % playlist.length; 
        }
    } else { 
        next = currentTrackIndex + 1; 
        if (next >= playlist.length) { 
            if (loopState === 1) {
                next = 0; 
            } else { 
                window.stopTrack(); 
                return; 
            } 
        } 
    }
    loadTrack(next);
}

window.prevTrack = function() {
    if(playlist.length === 0) {
        window.triggerBmoActionError();
        return; 
    }

    if (loopState === 2) {
        if (ytActive) {
            if (ytPlayer.contentWindow) {
                ytPlayer.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'seekTo', args: [0, true] }), '*');
                ytPlayer.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: "" }), '*');
            }
        } else {
            mainPlayer.currentTime = 0;
            playMedia();
        }
        return;
    }

    let prev = currentTrackIndex - 1; 
    
    if (prev < 0) { 
        if (loopState === 1) prev = playlist.length - 1; 
        else prev = 0; 
    } 
    loadTrack(prev);
}

/* --- SEEKING & TIME --- */
window.seekVideo = function(offset) {
    if (ytActive) {
        if (window.ytDuration && window.ytCurrentTime !== undefined) {
            let newTime = window.ytCurrentTime + offset;
            if (newTime < 0) newTime = 0;
            if (newTime > window.ytDuration) newTime = window.ytDuration;
            ytPlayer.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: 'seekTo',
                args: [newTime, true]
            }), '*');
        }
        return;
    }
    if (mainPlayer.readyState === 0 || !mainPlayer.duration) return; 
    
    if (!isFinite(mainPlayer.duration)) {
        logSystem("You cannot drag the never ending timeline", "warning");
        return;
    }
    
    let newTime = mainPlayer.currentTime + offset; 
    if (newTime < 0) newTime = 0; 
    if (newTime > mainPlayer.duration) newTime = mainPlayer.duration;
    
    mainPlayer.currentTime = newTime;
};

function updatePlayIcon(isPlaying) {
    // WMP9 logic: The transport button shows what action you will take (click to pause),
    // but the status bar shows the CURRENT actual state (playing).
    const transportCls = isPlaying ? 'ph-fill ph-pause' : 'ph-fill ph-play';
    const statusCls = isPlaying ? 'ph-fill ph-play' : 'ph-fill ph-pause';
    
    const innerIcon = document.getElementById('play-icon-inner');
    const statusIcon = document.getElementById('wmp9-status-icon');
    const statusIconImg = document.getElementById('wmp9-status-icon-img');
    const visControls = document.getElementById('status-vis-controls');
    
    if (innerIcon) innerIcon.className = transportCls;
    if(document.getElementById('fs-play-icon')) document.getElementById('fs-play-icon').className = transportCls;
    
    let isStream = false;
    let isYT = false;
    if (currentTrackIndex !== -1 && playlist[currentTrackIndex]) {
        isStream = (playlist[currentTrackIndex].folder === 'Network');
        isYT = playlist[currentTrackIndex].isYouTube;
    }

    if (statusIcon) {
        if (isStream && isPlaying) {
            statusIcon.style.display = 'none';
            if (statusIconImg) statusIconImg.style.display = 'block';
        } else {
            statusIcon.style.display = 'block';
            statusIcon.className = statusCls + ' wmp9-status-icon';
            if (statusIconImg) statusIconImg.style.display = 'none';
        }
    }
    
    const bottomStatus = document.getElementById('wmp9-status-text');
    if (bottomStatus) {
        if (isPlaying) {
            if (currentTrackIndex !== -1 && playlist[currentTrackIndex]) {
                let track = playlist[currentTrackIndex];
                let prefix = isStream ? "Streaming: " : "Playing: ";
                let spd = track.speed || (isYT ? "720p" : (isStream ? "128K" : ""));
                let speedText = spd ? " [" + spd + "]" : "";
                bottomStatus.innerText = prefix + (track.title || track.file.name) + speedText;
            } else {
                bottomStatus.innerText = "Playing";
            }
        } else {
            bottomStatus.innerText = "Paused";
        }
    }
    
    if (visControls) {
        if (currentTrackIndex !== -1) {
            visControls.style.opacity = '1';
            visControls.style.pointerEvents = 'auto';
        } else {
            visControls.style.opacity = '0.3';
            visControls.style.pointerEvents = 'none';
        }
    }
}

const seekLogic = (e) => {
    if (ytActive) {
        if (window.ytDuration) {
            const w = e.currentTarget.clientWidth;
            const newTime = (e.offsetX / w) * window.ytDuration;
            ytPlayer.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: 'seekTo',
                args: [newTime, true]
            }), '*');
        }
        return;
    }
    if(mainPlayer.duration) {
        if (!isFinite(mainPlayer.duration)) {
            logSystem("You cannot drag the never ending timeline", "warning");
            return;
        }
        const w = e.currentTarget.clientWidth;
        mainPlayer.currentTime = (e.offsetX / w) * mainPlayer.duration;
    }
};

if (document.getElementById('progress-container')) {
    document.getElementById('progress-container').addEventListener('click', seekLogic);
}

if (document.getElementById('fs-progress-container')) {
    document.getElementById('fs-progress-container').addEventListener('click', seekLogic);
}

const seekTooltip = document.getElementById('seek-tooltip');

const updateSeekTooltip = (e) => {
    let dur = ytActive ? window.ytDuration : mainPlayer.duration;
    if (!dur || !seekTooltip) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const pct = pos / rect.width;
    
    seekTooltip.innerText = formatTime(pct * dur);
    seekTooltip.style.left = e.clientX + 'px'; 
    seekTooltip.style.top = rect.top + 'px'; 
    seekTooltip.style.display = 'block';
};

const hideSeekTooltip = () => { 
    if (seekTooltip) seekTooltip.style.display = 'none'; 
};

if (document.getElementById('progress-container')) {
    document.getElementById('progress-container').addEventListener('mousemove', updateSeekTooltip); 
    document.getElementById('progress-container').addEventListener('mouseleave', hideSeekTooltip);
}

if (document.getElementById('fs-progress-container')) { 
    document.getElementById('fs-progress-container').addEventListener('mousemove', updateSeekTooltip); 
    document.getElementById('fs-progress-container').addEventListener('mouseleave', hideSeekTooltip); 
}

function formatTime(s) {
    if(!s || isNaN(s)) return "00:00";
    const m = Math.floor(s/60); 
    const sc = Math.floor(s%60);
    return `${m<10?'0':''}${m}:${sc<10?'0':''}${sc}`;
}

/* --- VOLUME CONTROLS --- */
let currentVolPercent = 100;
let savedVolPercent = 100;

function setVolume(volPercent, updateSliderInput = true) {
    currentVolPercent = Math.max(0, Math.min(200, Math.round(volPercent)));
    
    if (currentVolPercent > 100 && !audioInitialized && mainPlayer.readyState > 0 && !mainPlayer.paused && !ytActive) {
        if (mainPlayer.getAttribute('crossorigin') === 'anonymous') {
            initAudioChain();
        }
    }

    let physicalVal = Math.min(currentVolPercent, 100);
    
    if (updateSliderInput) {
        let mainSlider = document.getElementById('vol-slider');
        let fsSlider = document.getElementById('fs-vol-slider');
        
        if(mainSlider) mainSlider.value = physicalVal;
        
        if(fsSlider) { 
            let fsPhysical = currentVolPercent <= 100 ? (currentVolPercent / 100) * 75 : 75 + ((currentVolPercent - 100) / 100) * 25; 
            fsSlider.value = fsPhysical; 
        }
    }
    
    let volClipRect = document.getElementById('vol-fill-element');
    if (volClipRect) {
        volClipRect.style.width = physicalVal + '%'; 
    }

    const wmpVolIcon = document.getElementById('wmp9-vol-icon');
    if (wmpVolIcon) {
        if(currentVolPercent === 0) wmpVolIcon.className = "ph-fill ph-speaker-slash";
        else if(currentVolPercent < 50) wmpVolIcon.className = "ph-fill ph-speaker-low";
        else wmpVolIcon.className = "ph-fill ph-speaker-high";
    }

    if (ytActive && ytPlayer.contentWindow) { 
        try { 
            ytPlayer.contentWindow.postMessage(`{"event":"command","func":"setVolume","args":[${Math.min(currentVolPercent, 100)}]}`, '*'); 
        } catch(e){} 
    } else if (audioInitialized && volumeGainNode) {
        volumeGainNode.gain.value = currentVolPercent / 100;
        if (!ytActive) mainPlayer.volume = 1.0; // Force main element volume to max, so visualizer gets full signal
    } else {
        if (!ytActive) mainPlayer.volume = Math.min(currentVolPercent / 100, 1.0); 
    }
}

window.handleSliderChange = function(sliderVal) { 
    let physical = parseFloat(sliderVal); 
    setVolume(physical, false); 
};

window.toggleMute = function() { 
    if (currentVolPercent > 0) { 
        savedVolPercent = currentVolPercent; 
        setVolume(0, true); 
    } else { 
        setVolume(savedVolPercent === 0 ? 100 : savedVolPercent, true); 
    } 
};

if (dropZone) { 
    dropZone.addEventListener('wheel', (e) => { 
        if (e.target.closest('.rt-content-area') || e.target.closest('.ml-track-list-container') || e.target.closest('.copy-cd-right') || e.target.closest('.burn-list-body') || e.target.closest('.ps-sidebar') || e.target.closest('.ps-content') || e.target.closest('iframe') || e.target.closest('.dropdown') || e.target.closest('.context-menu')) {
            return; 
        }
        e.preventDefault(); 
        let newVol = currentVolPercent + (e.deltaY < 0 ? 5 : -5); 
        setVolume(newVol, true); 
    }, { passive: false }); 
}

/* --- WEB AUDIO API --- */
function initAudioChain() {
    if(audioInitialized) return;
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext; 
        audioCtx = new AudioContext(); 
        audioSource = audioCtx.createMediaElementSource(mainPlayer);               
        
        const freqs = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000]; 
        eqFilters = [];
        let prevNode = audioSource;

        freqs.forEach((freq, i) => { 
            const filter = audioCtx.createBiquadFilter(); 
            filter.type = 'peaking'; 
            filter.frequency.value = freq; 
            filter.Q.value = 1.5; 
            filter.gain.value = appState.eqGains[i] || 0; 
            prevNode.connect(filter); 
            prevNode = filter; 
            eqFilters.push(filter); 
        });

        analyser = audioCtx.createAnalyser(); 
        analyser.fftSize = 512; 
        prevNode.connect(analyser); // Analyser gets raw full volume signal here!

        volumeGainNode = audioCtx.createGain();
        volumeGainNode.gain.value = currentVolPercent / 100;
        analyser.connect(volumeGainNode);

        panner = audioCtx.createPanner(); 
        panner.panningModel = 'HRTF'; 
        panner.distanceModel = 'linear';
       
        if(appState.spatialEnabled) { 
            volumeGainNode.connect(panner); 
            panner.connect(audioCtx.destination); 
            isSpatialEnabled = true; 
        } else { 
            volumeGainNode.connect(audioCtx.destination); 
        }

        audioInitialized = true; 
        if (!ytActive) mainPlayer.volume = 1.0; // Hand off digital volume scaling entirely to the gain node
        
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    } catch (e) {}
}

window.updateEQ = function(idx, val) { 
    appState.eqGains[idx] = parseFloat(val); 
    saveConfig(); 
    
    if(!audioInitialized && mainPlayer && !mainPlayer.paused && !ytActive && mainPlayer.getAttribute('crossorigin') === 'anonymous') { 
        initAudioChain(); 
    } else if (audioInitialized && eqFilters[idx]) { 
        eqFilters[idx].gain.value = appState.eqGains[idx]; 
    } 
};

window.toggleSpatialAudio = function() {
    if(!audioInitialized) {
        if (mainPlayer.getAttribute('crossorigin') !== 'anonymous') {
            logSystem("Enhancements disabled for Radio streams", "error");
            return;
        }
        initAudioChain();
    }
    
    isSpatialEnabled = !isSpatialEnabled; 
    appState.spatialEnabled = isSpatialEnabled; 
    saveConfig();
    
    volumeGainNode.disconnect(); 
    panner.disconnect();
    
    if(isSpatialEnabled) { 
        volumeGainNode.connect(panner); 
        panner.connect(audioCtx.destination); 
    } else { 
        volumeGainNode.connect(audioCtx.destination); 
    }
};

/* --- AUDIO RECORDING --- */
let mediaRec; 
let chunks = [];

window.startRecording = async function() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); 
        mediaRec = new MediaRecorder(stream); 
        chunks = [];
        
        mediaRec.ondataavailable = (e) => { 
            chunks.push(e.data); 
        };
        
        mediaRec.onstop = () => { 
            const blob = new Blob(chunks, { type: 'audio/webm' }); 
            const url = URL.createObjectURL(blob); 
            const div = document.createElement('div'); 
            div.innerHTML = `<a href="${url}" download="wmp_rec_${Date.now()}.webm" style="color:var(--wmp9-playlist-bg);"><i class="ph ph-download"></i> wmp_rec_${Date.now()}.webm</a>`; 
            document.getElementById('recordings-list').prepend(div); 
        };
        
        mediaRec.start(); 
        document.getElementById('rec-dot').style.display = 'block'; 
        document.getElementById('btn-start-rec').disabled = true; 
        document.getElementById('btn-stop-rec').disabled = false;
    } catch(e) {}
};

window.stopRecording = function() { 
    if(mediaRec) { 
        mediaRec.stop(); 
        document.getElementById('rec-dot').style.display = 'none'; 
        document.getElementById('btn-start-rec').disabled = false; 
        document.getElementById('btn-stop-rec').disabled = true; 
    } 
};

/* --- VOICE CONTROL --- */
window.toggleVoice = function() {
    if(!('webkitSpeechRecognition' in window)) return; 
    
    const recognition = new webkitSpeechRecognition(); 
    recognition.continuous = false; 
    recognition.lang = 'en-US';
    
    recognition.onresult = (e) => { 
        const cmd = e.results[0][0].transcript.toLowerCase(); 
        if(cmd.includes('play')) togglePlay(); 
        else if(cmd.includes('stop')) stopTrack(); 
        else if(cmd.includes('next')) nextTrack(); 
        else if(cmd.includes('back')) prevTrack(); 
    };
    
    recognition.onend = () => { 
        document.getElementById('voice-status').style.display = 'none'; 
    };
    
    recognition.start(); 
    document.getElementById('adv-controls').classList.add('show'); 
    document.getElementById('voice-status').style.display = 'inline';
};

/* --- KEYBOARD SHORTCUTS --- */
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    
    // SKIN ESCAPE HATCH: If in a structural skin, pressing escape removes it
    if (e.code === 'Escape') {
        const wmpWindow = document.querySelector('.wmp9-window');
        if (wmpWindow.className.includes('skin-') && !wmpWindow.className.includes('skin-default')) {
            e.preventDefault();
            window.applySelectedSkin('default');
            if(window.showSkinChooser) window.showSkinChooser();
            return;
        }
    }

    if (e.code === 'Space') { e.preventDefault(); togglePlay(); } 
    else if (e.code === 'KeyS' && !e.ctrlKey) { stopTrack(); } 
    else if (e.code === 'KeyS' && e.shiftKey && !e.ctrlKey) { e.preventDefault(); window.takeSnapshot(); } 
    else if (e.code === 'KeyF') { toggleFullscreen(); } 
    else if (e.code === 'KeyM') { toggleMute(); } 
    else if (e.code === 'KeyP' && !e.ctrlKey) { prevTrack(); } 
    else if (e.code === 'KeyN' && !e.ctrlKey) { nextTrack(); } 
    else if (e.code === 'KeyA' && !e.ctrlKey) { e.preventDefault(); window.toggleAspectRatio(); } 
    else if (e.code === 'KeyV' && !e.ctrlKey) { cycleSubtitles(); } 
    // UPDATED: F1 now opens the new help-dialog
    else if (e.code === 'F1') { e.preventDefault(); openDialog('help-dialog'); } 
    else if (e.code === 'KeyO' && e.ctrlKey) { e.preventDefault(); document.getElementById('media-input').click(); } 
    else if (e.code === 'KeyU' && e.ctrlKey) { e.preventDefault(); window.promptNetworkStream(); } 
    else if (e.code === 'KeyC' && e.ctrlKey) { e.preventDefault(); window.openCaptureDevice(); } 
    else if (e.code === 'KeyE' && e.ctrlKey) { e.preventDefault(); openDialog('eq-dialog'); } 
    else if (e.code === 'KeyL' && e.ctrlKey) { e.preventDefault(); togglePlaylist(); } 
    else if (e.code === 'KeyP' && e.ctrlKey) { e.preventDefault(); togglePlay(); } 
    else if (e.code === 'KeyS' && e.ctrlKey) { e.preventDefault(); stopTrack(); } 
    else if (e.code === 'KeyF' && e.ctrlKey) { e.preventDefault(); nextTrack(); } 
    else if (e.code === 'KeyB' && e.ctrlKey) { e.preventDefault(); prevTrack(); } 
    else if (e.code === 'KeyH' && e.ctrlKey) { e.preventDefault(); window.toggleShuffle(); } 
    else if (e.code === 'KeyT' && e.ctrlKey) { e.preventDefault(); window.toggleLoop(); } 
    
    // NEW: Arrow key navigation for the Skin Chooser
    else if (e.code === 'ArrowUp') { 
        e.preventDefault(); 
        if (window.activeView === 'skin-chooser') {
            const activeSkin = document.querySelector('.sc-list-item.active');
            if (activeSkin && activeSkin.previousElementSibling) {
                activeSkin.previousElementSibling.click();
                activeSkin.previousElementSibling.scrollIntoView({ block: 'nearest' });
            }
        } else {
            setVolume(currentVolPercent + 10, true); 
        }
    } 
    else if (e.code === 'ArrowDown') { 
        e.preventDefault(); 
        if (window.activeView === 'skin-chooser') {
            const activeSkin = document.querySelector('.sc-list-item.active');
            if (activeSkin && activeSkin.nextElementSibling) {
                activeSkin.nextElementSibling.click();
                activeSkin.nextElementSibling.scrollIntoView({ block: 'nearest' });
            }
        } else {
            setVolume(currentVolPercent - 10, true); 
        }
    } 
    // NEW: Enter key applies the selected skin
    else if (e.code === 'Enter') {
        if (window.activeView === 'skin-chooser') {
            e.preventDefault();
            const activeSkin = document.querySelector('.sc-list-item.active');
            if (activeSkin) {
                activeSkin.dispatchEvent(new MouseEvent('dblclick'));
            }
        }
    }
    
    else if (e.code === 'ArrowRight') { e.preventDefault(); window.seekVideo(10); } 
    else if (e.code === 'ArrowLeft') { e.preventDefault(); window.seekVideo(-10); } 
    else if (e.code === 'BracketRight' && !e.ctrlKey) { e.preventDefault(); window.increaseSpeed(); } 
    else if (e.code === 'BracketLeft' && !e.ctrlKey) { e.preventDefault(); window.decreaseSpeed(); } 
    else if (e.code === 'F8') { e.preventDefault(); toggleMute(); } 
    else if (e.code === 'F9') { e.preventDefault(); setVolume(currentVolPercent - 5, true); } 
    else if (e.code === 'F10') { e.preventDefault(); setVolume(currentVolPercent + 5, true); } 
});

setVolume(100);

/* --- COLOR CYCLE LOGIC --- */
window.visColors = ['#00ee00', '#00ffff', '#0000ff', '#8a2be2', '#ff00ff', '#ff0000', '#ff8800', '#ffff00'];
window.currentVisColorIndex = 0;

window.cycleVisColor = function() {
    window.currentVisColorIndex = (window.currentVisColorIndex + 1) % window.visColors.length;
    const color = window.visColors[window.currentVisColorIndex];

    const elementsToColor = [
        'color-cycle-btn',
        'format-toggle-btn',
        'stereo-text',
        'radio-visualizer-fallback',
        'format-display-fallback'
    ];

    elementsToColor.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.color = color;
    });

    const elementsToBg = [
        'stereo-dot-1',
        'stereo-dot-2'
    ];

    elementsToBg.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.backgroundColor = color;
    });
};

/* --- BEAT DETECTION & AUDIO OSCILLOSCOPE --- */
let visualizerAnimFrame;
let freqData = new Uint8Array(0);
let timeDomainData = new Uint8Array(0);
let currentVisRate = 1.0;
let targetVisRate = 1.0;

function syncVisualizerToBeat() {
    const miniCanvas = document.getElementById('mini-visualizer');
    const miniCtx = miniCanvas ? miniCanvas.getContext('2d') : null;
    const fallbackRadio = document.getElementById('radio-visualizer-fallback');
    const fallbackFormat = document.getElementById('format-display-fallback');

    let isRadio = false;
    let currentFmt = "MP3";
    
    if (currentTrackIndex !== -1 && playlist[currentTrackIndex]) {
        const track = playlist[currentTrackIndex];
        isRadio = (track.folder === 'Network' || track.isStream);
        
        if (track.isYouTube) {
            currentFmt = 'Streaming';
        } else if (track.url && typeof track.url === 'string' && track.url.toLowerCase().includes('.m3u8')) {
            currentFmt = 'HLS';
        } else if (track.file && track.file.name) {
            const extMatch = track.file.name.match(/\.([a-z0-9]+)$/i);
            if (extMatch) currentFmt = extMatch[1].toUpperCase();
        } else if (track.folder === 'Network' || track.isStream) {
            currentFmt = 'NET';
        }
    }

    if (showingFormat) {
        if (miniCanvas) miniCanvas.style.display = 'none';
        if (fallbackRadio) fallbackRadio.style.display = 'none';
        if (fallbackFormat) {
            fallbackFormat.style.display = 'block';
            fallbackFormat.innerText = currentFmt;
        }
    } else {
        if (fallbackFormat) fallbackFormat.style.display = 'none';
        
        if (ytActive) {
            if (miniCanvas) miniCanvas.style.display = 'none';
            if (fallbackRadio) {
                fallbackRadio.style.display = 'block';
                fallbackRadio.innerText = 'Streaming';
            }
        } else if (isRadio && !mainPlayer.paused) {
            if (miniCanvas) miniCanvas.style.display = 'none';
            if (fallbackRadio) {
                fallbackRadio.style.display = 'block';
                fallbackRadio.innerText = 'Radio';
            }
        } else {
            if (miniCanvas) miniCanvas.style.display = 'block';
            if (fallbackRadio) fallbackRadio.style.display = 'none';

            if (miniCtx && (!analyser || !audioInitialized || mainPlayer.paused || mainPlayer.ended)) {
                miniCtx.clearRect(0, 0, miniCanvas.width, miniCanvas.height);
                miniCtx.lineWidth = 1.5;
                miniCtx.strokeStyle = window.visColors[window.currentVisColorIndex];
                miniCtx.beginPath();
                miniCtx.moveTo(0, miniCanvas.height / 2);
                miniCtx.lineTo(miniCanvas.width, miniCanvas.height / 2);
                miniCtx.stroke();
            } else if (miniCtx && analyser && audioInitialized && !mainPlayer.paused && !mainPlayer.ended) {
                if (timeDomainData.length !== analyser.frequencyBinCount) {
                    timeDomainData = new Uint8Array(analyser.frequencyBinCount);
                }
                analyser.getByteTimeDomainData(timeDomainData);

                miniCtx.clearRect(0, 0, miniCanvas.width, miniCanvas.height);
                miniCtx.lineWidth = 1.5;
                miniCtx.strokeStyle = window.visColors[window.currentVisColorIndex];
                miniCtx.beginPath();

                const sliceWidth = miniCanvas.width * 1.0 / analyser.frequencyBinCount;
                let x = 0;

                for (let i = 0; i < analyser.frequencyBinCount; i++) {
                    const v = timeDomainData[i] / 128.0;
                    const y = v * (miniCanvas.height / 2);

                    if (i === 0) {
                        miniCtx.moveTo(x, y);
                    } else {
                        miniCtx.lineTo(x, y);
                    }
                    x += sliceWidth;
                }
                miniCtx.lineTo(miniCanvas.width, miniCanvas.height / 2);
                miniCtx.stroke();
            }
        }
    }

    // VISUALIZER SYNC FIX: Safely force visualizer to follow mainPlayer without spamming the play Promise
    if (visualizer) {
        let isAudioPlaying = (!mainPlayer.paused && !mainPlayer.ended && !ytActive && currentTrackIndex !== -1);
        
        if (isAudioPlaying && visualizer.style.display === 'block') {
            if (visualizer.paused && !visualizer.dataset.playPending) {
                visualizer.dataset.playPending = 'true';
                if (typeof visualizer.play === 'function') {
                    let p = visualizer.play();
                    if (p !== undefined) {
                        p.then(() => { visualizer.dataset.playPending = ''; })
                         .catch(() => { visualizer.dataset.playPending = ''; });
                    } else {
                        visualizer.dataset.playPending = '';
                    }
                } else {
                    visualizer.dataset.playPending = '';
                }
            }
        } else if (!isAudioPlaying && !visualizer.paused) {
            if (typeof visualizer.pause === 'function') {
                visualizer.pause();
            }
        }
    }

    if (!visualizer || visualizer.style.display !== 'block' || mainPlayer.paused) {
        visualizerAnimFrame = requestAnimationFrame(syncVisualizerToBeat);
        return;
    }
    
    if (window.activeVisMode === 'ambiance') {
        if (visualizer.playbackRate !== 1.0) visualizer.playbackRate = 1.0;
        visualizerAnimFrame = requestAnimationFrame(syncVisualizerToBeat);
        return;
    }
    
    if (analyser && audioInitialized) {
        if (freqData.length !== analyser.frequencyBinCount) {
            freqData = new Uint8Array(analyser.frequencyBinCount);
        }
        analyser.getByteFrequencyData(freqData);
        
        let bassSum = 0;
        let bassCount = Math.max(1, Math.floor(freqData.length * 0.1));
        for (let i = 0; i < bassCount; i++) {
            bassSum += freqData[i];
        }
        let bassAvg = bassSum / bassCount; 

        targetVisRate = 0.8 + (bassAvg / 255) * 1.7;
        
        currentVisRate += (targetVisRate - currentVisRate) * 0.1;
        
        if (typeof visualizer.playbackRate !== 'undefined') {
            visualizer.playbackRate = Math.max(0.5, Math.min(currentVisRate, 2.5));
        }
    }
    
    visualizerAnimFrame = requestAnimationFrame(syncVisualizerToBeat);
}

/* --- SKIN CHOOSER ENGINE --- */
window.applySelectedSkin = function(skinName) {
    const wmpWindow = document.querySelector('.wmp9-window');
    const wreathOverlay = document.getElementById('wreath-overlay');
    const bmoFace = document.querySelector('.bmo-face');

    // 1. Remove all possible structural skin classes
    wmpWindow.classList.remove(
        'skin-mini', 'skin-compact', 'skin-bauble', 'skin-wreath',
        'skin-diamond', 'skin-pillar', 'skin-bmo', 'skin-capsule', 
        'skin-hexagon', 'skin-shield', 'skin-blob', 'skin-rattleballs'
    ); 
    
    // Hide specialized overlays by default
    if (wreathOverlay) wreathOverlay.style.display = 'none';
    if (bmoFace) bmoFace.style.display = 'none';

    // 2. Apply the new skin class
    if (skinName === 'default') {
        logSystem("Skin applied: Default (Royal)");
        document.body.classList.remove('skin-active');
    } else {
        wmpWindow.classList.add(skinName);
        document.body.classList.add('skin-active'); // Required to trigger the global return button
        logSystem("Skin applied: " + skinName);
        
        // Show specific overlays if needed
        if (skinName === 'skin-wreath' && wreathOverlay) {
            wreathOverlay.style.display = 'block';
        }
        if (skinName === 'skin-bmo' && bmoFace) {
            bmoFace.src = 'https://proxy.duckduckgo.com/iu/?u=https://i.imgur.com/XyKeIJB.png'; // <--- This line resets the face!
            bmoFace.style.display = 'block';
        }
    }
    
    // 3. Automatically return to the Now Playing view so they can see the player!
    window.showNowPlaying();
    
    // 4. Force the aspect ratio to recalculate for the new window size
    setTimeout(window.applyAspectRatio, 100);
};

/* --- POPOUT ENGINE --- */
window.triggerPopout = function(specificSkin = null) {
    const wmpWindow = document.querySelector('.wmp9-window');
    let activeSkin = specificSkin;
    
    if (!activeSkin) {
        const classes = wmpWindow.className.split(' ');
        for (let c of classes) {
            if (c.startsWith('skin-') && c !== 'skin-default') {
                activeSkin = c;
                break;
            }
        }
    }

    if (!activeSkin || activeSkin === 'default') {
        logSystem("Only specialized skins can be popped out.", "warning");
        return;
    }

    // Hardcoded to force the popup to use your live domain
    let baseUrl = "https://wmp9.ywa.app/index.htm";

    const popoutUrl = `${baseUrl}?popout=true&skin=${activeSkin}`;

    // Define pixel-perfect dimensions for each skin
    let w = 400, h = 500;
    if (activeSkin === 'skin-bmo') { w = 320; h = 480; }
    else if (activeSkin === 'skin-compact') { w = 450; h = 130; }
    else if (activeSkin === 'skin-mini') { w = 320; h = 400; }
    else if (activeSkin === 'skin-bauble') { w = 400; h = 420; }
    else if (activeSkin === 'skin-wreath') { w = 450; h = 450; }
    else if (activeSkin === 'skin-diamond') { w = 520; h = 520; }
    else if (activeSkin === 'skin-pillar') { w = 240; h = 450; }
    else if (activeSkin === 'skin-capsule') { w = 350; h = 480; }
    else if (activeSkin === 'skin-hexagon') { w = 480; h = 530; }
    else if (activeSkin === 'skin-shield') { w = 420; h = 520; }
    else if (activeSkin === 'skin-blob') { w = 420; h = 420; }
    else if (activeSkin === 'skin-rattleballs') { w = 420; h = 520; }

    const features = `width=${w},height=${h},menubar=no,toolbar=no,location=no,status=no,resizable=no,scrollbars=no`;
    window.open(popoutUrl, `WMP9_${activeSkin}`, features);
    
    // Automatically return the main window back to default so they don't look like duplicates
    window.applySelectedSkin('default');
};

// --- BOOTLOADER (Runs automatically on load) ---
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('popout') === 'true') {
    const popoutSkin = urlParams.get('skin');
    
    // Inject strict CSS for the dark background
    const style = document.createElement('style');
    style.innerHTML = `
        body { background: #000000 !important; }
    `;
    document.head.appendChild(style);

    // Foolproof removal of buttons from the DOM so they never show in the pop-out
    const returnBtn = document.querySelector('.global-return-btn');
    const popoutBtn = document.querySelector('.global-popout-btn');
    const floatTab = document.querySelector('.wmp9-floating-tab');
    if (returnBtn) returnBtn.remove();
    if (popoutBtn) popoutBtn.remove();
    if (floatTab) floatTab.remove();

    if (popoutSkin) {
        // Wait a tiny moment for the DOM to settle, then force the skin
        setTimeout(() => {
            window.applySelectedSkin(popoutSkin);
        }, 100);
    }
}

syncVisualizerToBeat();