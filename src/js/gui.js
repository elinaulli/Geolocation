import Popup from "./Popup.js";

export default class GeoFeedApp {
  constructor() {
    this.posts = [];
    this.popup = new Popup();
    this.isGeolocationSupported = "geolocation" in navigator;
    this.isSubmitting = false; // Флаг против двойных кликов
    this.init();
  }

  init() {
    this.loadPosts();
    this.bindEvents();
    this.renderPosts();
  }

  bindEvents() {
    const submitBtn = document.getElementById("submitPost");
    const postText = document.getElementById("postText");

    console.log("Навешиваем обработчики событий...");

    // Удаляем старые обработчики (если есть)
    submitBtn.replaceWith(submitBtn.cloneNode(true));
    const newSubmitBtn = document.getElementById("submitPost");

    newSubmitBtn.addEventListener("click", (e) => {
      console.log("Клик по кнопке");
      e.preventDefault();
      e.stopPropagation();
      this.handleSubmit();
    });

    postText.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        console.log("Ctrl+Enter нажато");
        e.preventDefault();
        this.handleSubmit();
      }
    });
  }

  async getGeolocation() {
    console.log("getGeolocation вызван");

    return new Promise((resolve, reject) => {
      if (!this.isGeolocationSupported) {
        reject(new Error("Геолокация не поддерживается"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Геолокация получена успешно");
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            source: "geolocation",
          };
          resolve(coords);
        },
        (error) => {
          console.log("Ошибка геолокации:", error.message);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    });
  }

  async getGeolocationForPost() {
    console.log("getGeolocationForPost вызван");

    try {
      const coords = await this.getGeolocation();
      return {
        ...coords,
        source: "geolocation",
      };
    } catch (error) {
      console.warn("Не удалось получить геолокацию:", error.message);

      try {
        const coords = await this.popup.show();
        return {
          ...coords,
          source: "manual",
        };
      } catch (popupError) {
        console.log("Пользователь отменил ввод координат");
        throw new Error("Координаты не указаны");
      }
    }
  }

  async handleSubmit() {

  if (this.isSubmitting) {
    return;
  }

  this.isSubmitting = true;

  const textarea = document.getElementById("postText");
  const submitBtn = document.getElementById("submitPost");
  const text = textarea.value.trim();

  try {
    if (!text) {
      alert("Введите текст поста");
      textarea.focus();
      return;
    }

    let coordinates;
    try {
      coordinates = await this.getGeolocationForPost();
    } catch (coordsError) {
      console.log("Ошибка получения координат:", coordsError.message);
      alert("Для создания поста необходимы координаты");
      return;
    }

    this.addPost(text, coordinates);
    textarea.value = "";

    const firstPost = document.querySelector(".post");
    if (firstPost) {
      firstPost.scrollIntoView({ behavior: "smooth" });
    }
  } catch (error) {
    console.error("Ошибка при создании поста:", error);
    alert("Произошла ошибка при создании поста: " + error.message);
  } finally {
    this.isSubmitting = false;
  }
}

  addPost(text, coordinates) {
    const post = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      date: new Date(),
      text,
      coordinates: {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      },
      source: coordinates.source || "unknown",
    };

    this.posts.unshift(post);
    this.savePosts();
    this.renderPosts();
  }

  savePosts() {
    try {
      localStorage.setItem("geoFeedPosts", JSON.stringify(this.posts));
    } catch (error) {
      console.error("Ошибка сохранения постов:", error);
    }
  }

  loadPosts() {
    try {
      const saved = localStorage.getItem("geoFeedPosts");
      if (saved) {
        this.posts = JSON.parse(saved);
      }
    } catch (e) {
      console.error("Ошибка загрузки постов:", e);
      this.posts = [];
    }
  }

  renderPosts() {
    const feedContainer = document.querySelector(".feed-container");

    feedContainer.innerHTML = "";
    this.posts.forEach((post) => {
      const postElement = this.createPostElement(post);
      feedContainer.append(postElement);
    });
  }

  createPostElement(post) {
    const postElement = document.createElement("div");
    postElement.className = "post";

    const dateString = new Date(post.date).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const lat = post.coordinates.latitude.toFixed(6);
    const lon = post.coordinates.longitude.toFixed(6);

    postElement.innerHTML = `
      <div class="post-header">
      <div class="post-date">${dateString}</div>
      </div>
      <div class="post-content">${this.escapeHtml(post.text)}</div>
      <div class="post-location">
        [${lat}, ${lon}] 
      </div>
    `;

    return postElement;
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

if (!window.geoFeedApp) {
  document.addEventListener("DOMContentLoaded", () => {
    window.geoFeedApp = new GeoFeedApp();
  });
} else {
  console.log("Приложение уже создано");
}
