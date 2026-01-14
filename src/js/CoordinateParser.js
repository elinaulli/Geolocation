export default class CoordinateParser {
  static parse(input) {
    if (!input || typeof input !== "string") {
      throw new Error("Входные данные должны быть строкой");
    }

    const trimmedInput = input.trim();

    if (!trimmedInput) {
      throw new Error("Строка не может быть пустой");
    }

    const hasOpeningBracket = trimmedInput.startsWith("[");
    const hasClosingBracket = trimmedInput.endsWith("]");

    if (
      (hasOpeningBracket && !hasClosingBracket) ||
      (!hasOpeningBracket && hasClosingBracket)
    ) {
      throw new Error("Непарные квадратные скобки");
    }

    let cleaned = trimmedInput;

    if (hasOpeningBracket && hasClosingBracket) {
      cleaned = cleaned.substring(1, cleaned.length - 1).trim();
    }

    cleaned = cleaned
      .replace(/[−—–‐]/g, "-")
      .replace(/\s*,\s*/g, ",")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleaned) {
      throw new Error("Строка не может быть пустой после удаления скобок");
    }
    const parts = cleaned.split(",");

    if (parts.length !== 2) {
      throw new Error(
        `Ожидалось 2 координаты, получено ${parts.length}. Формат: "широта, долгота"`,
      );
    }

    const latStr = parts[0].trim();
    const lonStr = parts[1].trim();

    const latitude = parseFloat(latStr);
    const longitude = parseFloat(lonStr);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error(`Неверные числа: "${latStr}", "${lonStr}"`);
    }

    if (latitude < -90 || latitude > 90) {
      throw new Error(`Широта ${latitude} вне диапазона -90..90`);
    }

    if (longitude < -180 || longitude > 180) {
      throw new Error(`Долгота ${longitude} вне диапазона -180..180`);
    }

    return { latitude, longitude };
  }

  static isValid(input) {
    try {
      this.parse(input);
      return true;
    } catch (error) {
      console.warn("Ошибка валидации:", error.message);
      return false;
    }
  }
}
