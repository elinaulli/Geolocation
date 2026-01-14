import CoordinateParser from "../CoordinateParser.js";

describe("CoordinateParser со строгой проверкой скобок", () => {
  describe("parse() - корректные данные", () => {
    test("обрабатывает координаты с пробелом после запятой", () => {
      const input = "51.50851, −0.12572";
      const result = CoordinateParser.parse(input);
      expect(result).toEqual({ latitude: 51.50851, longitude: -0.12572 });
    });

    test("обрабатывает координаты без пробела после запятой", () => {
      const input = "51.50851,−0.12572";
      const result = CoordinateParser.parse(input);
      expect(result).toEqual({ latitude: 51.50851, longitude: -0.12572 });
    });

    test("обрабатывает координаты в квадратных скобках с пробелом", () => {
      const input = "[51.50851, −0.12572]";
      const result = CoordinateParser.parse(input);
      expect(result).toEqual({ latitude: 51.50851, longitude: -0.12572 });
    });

    test("обрабатывает координаты без скобок", () => {
      const input = "51.50851, -0.12572";
      const result = CoordinateParser.parse(input);
      expect(result).toEqual({ latitude: 51.50851, longitude: -0.12572 });
    });

    test("обрабатывает координаты в скобках без пробела", () => {
      const input = "[51.50851,−0.12572]";
      const result = CoordinateParser.parse(input);
      expect(result).toEqual({ latitude: 51.50851, longitude: -0.12572 });
    });
  });

  describe("parse() - исключения", () => {
    test("выбрасывает ошибку при null", () => {
      expect(() => CoordinateParser.parse(null)).toThrow(
        "Входные данные должны быть строкой",
      );
    });

    test("выбрасывает ошибку при пустой строке", () => {
      expect(() => CoordinateParser.parse("")).toThrow(
        "Входные данные должны быть строкой",
      );
    });

    test("выбрасывает ошибку при строке только с пробелами", () => {
      expect(() => CoordinateParser.parse("   ")).toThrow(
        "Строка не может быть пустой",
      );
    });

    test("выбрасывает ошибку при непарных скобках - только открывающая", () => {
      expect(() => CoordinateParser.parse("[51.50851, -0.12572")).toThrow(
        "Непарные квадратные скобки",
      );
    });

    test("выбрасывает ошибку при непарных скобках - только закрывающая", () => {
      expect(() => CoordinateParser.parse("51.50851, -0.12572]")).toThrow(
        "Непарные квадратные скобки",
      );
    });

    test("выбрасывает ошибку при пустых скобках", () => {
      expect(() => CoordinateParser.parse("[]")).toThrow(
        "Строка не может быть пустой после удаления скобок",
      );
    });

    test("выбрасывает ошибку при скобках с пробелами внутри", () => {
      expect(() => CoordinateParser.parse("[   ]")).toThrow(
        "Строка не может быть пустой после удаления скобок",
      );
    });

    test("выбрасывает ошибку при скобках с запятой внутри", () => {
      expect(() => CoordinateParser.parse("[,]")).toThrow(
        'Неверные числа: "", ""',
      );
    });

    test("выбрасывает ошибку при одной координате в скобках", () => {
      expect(() => CoordinateParser.parse("[51.50851]")).toThrow(
        "Ожидалось 2 координаты, получено 1",
      );
    });

    test("выбрасывает ошибку при трех координатах в скобках", () => {
      expect(() => CoordinateParser.parse("[51.50851, -0.12572, 100]")).toThrow(
        "Ожидалось 2 координаты, получено 3",
      );
    });

    test("выбрасывает ошибку при тексте внутри скобок", () => {
      expect(() => CoordinateParser.parse("[abc, def]")).toThrow(
        'Неверные числа: "abc", "def"',
      );
    });
  });

  describe("isValid() - валидация", () => {
    test("возвращает true для корректных данных", () => {
      expect(CoordinateParser.isValid("51.50851, −0.12572")).toBe(true);
      expect(CoordinateParser.isValid("51.50851,−0.12572")).toBe(true);
      expect(CoordinateParser.isValid("[51.50851, −0.12572]")).toBe(true);
    });

    test("возвращает false для некорректных скобок", () => {
      expect(CoordinateParser.isValid("[51.50851, -0.12572")).toBe(false);
      expect(CoordinateParser.isValid("51.50851, -0.12572]")).toBe(false);
      expect(CoordinateParser.isValid("[]")).toBe(false);
    });

    test("возвращает false для некорректных данных", () => {
      expect(CoordinateParser.isValid("")).toBe(false);
      expect(CoordinateParser.isValid("51.50851")).toBe(false);
      expect(CoordinateParser.isValid("abc, def")).toBe(false);
    });
  });

  describe("parse() - граничные значения", () => {
    test("обрабатывает минимальные значения в скобках", () => {
      const input = "[-90, -180]";
      const result = CoordinateParser.parse(input);
      expect(result).toEqual({ latitude: -90, longitude: -180 });
    });

    test("обрабатывает максимальные значения в скобках", () => {
      const input = "[90, 180]";
      const result = CoordinateParser.parse(input);
      expect(result).toEqual({ latitude: 90, longitude: 180 });
    });

    test("обрабатывает нулевые координаты в скобках", () => {
      const input = "[0, 0]";
      const result = CoordinateParser.parse(input);
      expect(result).toEqual({ latitude: 0, longitude: 0 });
    });
  });
});
