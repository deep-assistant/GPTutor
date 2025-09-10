import { LessonItem } from "../LessonItem";
import { LessonRequest } from "../LessonRequest";
import { ActionSuggestion } from "../ActionSuggestion";

const BasedJS = "Основы JavaScript";
const AdvancedJS = "Продвинутый JavaScript";
const DOMJS = "Браузер: DOM";

const lessonJS1 = new LessonItem(
  "Переменные",
  BasedJS,
  new LessonRequest(
    "Объясни переменные const, let и var, в чем их отличия и покажи примеры"
  ),
  [
    new LessonRequest(
      "Объясни подробнее const в js, укажи примеры",
      "Переменные const"
    ),
    new LessonRequest("Объясни подробнее let, укажи примеры", "Переменные let"),
    new LessonRequest("Объясни подробнее var, укажи примеры", "Переменные var"),
    new LessonRequest("В чем отличия let от var?"),
    new LessonRequest("Когда лучше использовать let, const, var?"),
  ],
  [
    new ActionSuggestion("Дай мне задание на переменные для практики", "Практическое задание"),
    new ActionSuggestion("Покажи пример реального использования переменных", "Реальный пример"),
    new ActionSuggestion("Объясни частые ошибки при работе с переменными", "Частые ошибки"),
  ]
);

const lessonJS2 = new LessonItem(
  "Типы данных",
  BasedJS,
  new LessonRequest("Расскажи о типах данных в js"),
  [
    new LessonRequest("Объясни числа в js", "Числа"),
    new LessonRequest("Объясни строки в js", "Строки"),
    new LessonRequest("Объясни Булевый тип в js", "Булевый тип"),
    new LessonRequest("Объясни объекты в js", "Объекты"),
    new LessonRequest("Объясни Symbol в js", "Символы"),
    new LessonRequest("Объясни BigInt в js", "BigInt"),
    new LessonRequest("Объясни null в js", "null"),
    new LessonRequest("Объясни undefined в js", "undefined"),
    new LessonRequest("Объясни оператор typeof", "Оператор typeof"),
  ],
  [
    new ActionSuggestion("Покажи как проверить тип переменной в разных случаях", "Проверка типов"),
    new ActionSuggestion("Дай упражнения на приведение типов", "Упражнения на типы"),
  ]
);

const lessonJS3 = new LessonItem(
  "Базовые операторы, математика",
  BasedJS,
  new LessonRequest(
    "Расскажи о базовых математических операторах в javascript, приведи примеры каждого из них"
  ),
  [
    new LessonRequest("Объясни сложение строк в js", "Сложение строк"),
    new LessonRequest("Объясни приведение к числу в js", "Приведение к числу"),
    new LessonRequest(
      "Объясни инкремент/декремент в js",
      "Инкремент/декремент"
    ),
    new LessonRequest(
      "Объясни побитовые операторы в js",
      "Побитовые операторы"
    ),
  ]
);

const lessonJS4 = new LessonItem(
  "Операторы сравнения",
  BasedJS,
  new LessonRequest("Расскажи об операторах сравнения в javascript"),
  [
    new LessonRequest("Объясни сравнение строк в js", "Сравнение строк"),
    new LessonRequest(
      "Объясни сравнение разных типов в js",
      "Сравнение разных типов"
    ),
    new LessonRequest("Объясни строгое сравнение в js", "Строгое сравнение"),
  ]
);

const lessonJS5 = new LessonItem(
  "Условия",
  BasedJS,
  new LessonRequest("Расскажи об условиях в javascript"),
  [
    new LessonRequest("Объясни ```if``` в js", "Инструкция «if»"),
    new LessonRequest("Объясни ```else``` в js", "Блок «else»"),
    new LessonRequest(
      "Объясни условный оператор ```?```",
      "Условный оператор «?»"
    ),
  ]
);

const lessonJS6 = new LessonItem(
  "Логические операторы",
  BasedJS,
  new LessonRequest("Расскажи об логических операторах в javascript"),
  [
    new LessonRequest("Объясни ```||``` в js", "|| (ИЛИ)"),
    new LessonRequest("Объясни ```&&``` в js", "&& (И)"),
    new LessonRequest("Объясни ```!``` в js", "! (НЕ)"),
  ]
);

const lessonJS7 = new LessonItem(
  "Циклы",
  BasedJS,
  new LessonRequest("Расскажи о циклах в js"),
  [
    new LessonRequest("Объясни цикл ```while``` в js", "Цикл «while»"),
    new LessonRequest("Объясни цикл ```do…while``` в js", "Цикл «do…while»"),
    new LessonRequest("Объясни цикл ```for``` в js", "Цикл «for»"),
    new LessonRequest("Объясни ```break``` в js", "«break»"),
    new LessonRequest("Объясни ```continue``` в js", "«continue»"),
  ]
);

const lessonJS8 = new LessonItem(
  "Массивы",
  BasedJS,
  new LessonRequest("Расскажи о массивах в js"),
  [
    new LessonRequest("Как создать массив в js", "Объявление"),
    new LessonRequest("Расскажи о методах массивв", "Методы массива"),
    new LessonRequest(
      "Расскажи о  ```pop/push```, ```shift/unshift``` в js",
      "pop/push, shift/unshift"
    ),
    new LessonRequest(
      "Расскажи о Многомерных массивах в js",
      "Многомерные массивы"
    ),
    new LessonRequest(
      "Расскажи о способах перебора массива в js",
      "Перебор массива"
    ),
  ]
);

const lessonJS9 = new LessonItem(
  "Функции",
  BasedJS,
  new LessonRequest("Расскажи о функциях в js"),
  [
    new LessonRequest(
      "Объясни Function Expression в js",
      "Function Expression"
    ),
    new LessonRequest(
      "Объясни Function Declaration в js",
      "Function Declaration"
    ),
    new LessonRequest(
      "Объясни стрелочные функции в js, в чем их отлчия",
      "Стрелочные функции"
    ),
    new LessonRequest("Объясни контекст функции в js", "Контекст"),
  ],
  [
    new ActionSuggestion("Дай мне задачу написать функцию", "Написать функцию"),
    new ActionSuggestion("Покажи примеры использования колбэков", "Примеры колбэков"),
    new ActionSuggestion("Объясни как работает замыкание в функциях", "Замыкания"),
  ]
);

const lessonJS10 = new LessonItem(
  "Методы массивов",
  BasedJS,
  new LessonRequest("Расскажи о методах массивов в js"),
  [
    new LessonRequest("Расскажи о ```splice``` в js", "splice"),
    new LessonRequest("Расскажи о ```slice``` в js", "slice"),
    new LessonRequest("Расскажи о ```concat``` в js", "concat"),
    new LessonRequest("Расскажи о ```forEach``` в js", "Перебор: forEach"),

    new LessonRequest("Расскажи о методе ```filter``` в js", "filter"),
    new LessonRequest("Расскажи о методе ```map``` в js", "map"),
    new LessonRequest("Расскажи о методе ```sort``` в js", "sort"),
    new LessonRequest("Расскажи о методе ```reverse``` в js", "reverse"),
    new LessonRequest("Расскажи о методе ```reduce``` в js", "reduce"),
    new LessonRequest("Расскажи о  ```Array.isArray``` в js", "Array.isArray"),
    new LessonRequest(
      "Расскажи о методах ```indexOf```, ```lastIndexOf```, ```includes``` в js",
      "Поиск в массиве по значению"
    ),
    new LessonRequest(
      "Расскажи о методах ```find```, ```findIndex```, ```findLastIndex``` в js",
      "Поиск в массиве с условием"
    ),
  ]
);

const lessonJS11 = new LessonItem(
  "Объекты",
  BasedJS,
  new LessonRequest("Расскажи об Объектах в js"),
  [
    new LessonRequest("Расскажи о доступе к полям объекта", "Доступ"),
    new LessonRequest(
      "Расскажи об изменениях полей в js",
      "Изменение значений"
    ),
    new LessonRequest(
      "Расскажи об удалении полей из обьекта",
      "Удаление полей"
    ),
    new LessonRequest(
      "Расскажи о проверки полей на существование в обьекте",
      "Проверка на существование"
    ),

    new LessonRequest(
      "Расскажи о способах перебора обьекта",
      "Перебор объектов"
    ),
    new LessonRequest("Расакажи о методах объектов", "Методы объектов"),
  ]
);

const lessonJS12 = new LessonItem(
  "Map и Set",
  BasedJS,
  new LessonRequest("Расскажи о ```Map``` и ```Set``` в js"),
  [
    new LessonRequest("Расскажи о ```Map``` в js", "Map"),
    new LessonRequest("Расскажи о ```Set``` в js", "Set"),
  ]
);

const lessonJS13 = new LessonItem(
  "Рекурсия",
  BasedJS,
  new LessonRequest("Расскажи о рекурсии в js"),
  [
    new LessonRequest(
      "Расскажи о различии рекурсивного обхода и цикличного",
      "Циклы и рекурсия"
    ),
    new LessonRequest(
      "Расскажи об рекурсивных структурах",
      "Рекурсивные структуры"
    ),
    new LessonRequest("Как обходить рекурсией деревья", "Деревья"),
    new LessonRequest(
      "Как обходоить рекурсией свзяные списки",
      "Связные списки"
    ),
  ]
);

const lessonJS14 = new LessonItem(
  "Область видимости",
  BasedJS,
  new LessonRequest("Расскажи об области видимости в js"),
  [new LessonRequest("Расскажи об видах области видимости", "Виды")]
);

const lessonJS15 = new LessonItem(
  "Замыкание",
  BasedJS,
  new LessonRequest("Объясни замыкание в js"),
  [
    new LessonRequest(
      "Покажи полезные примеры использования замыканий в js",
      "Примеры замыканий"
    ),
  ]
);

const lessonJS16 = new LessonItem(
  "Классы",
  BasedJS,
  new LessonRequest("Расскажи о классах в js"),
  [
    new LessonRequest("Покажи примеры классов в js", "Примеры классов"),
    new LessonRequest("Объясни свойства классов в js", "Свойства классов"),
    new LessonRequest("Объясни методы классов в js", "Методы классов"),
    new LessonRequest("Объясни наследование классов в js", "Наследование"),
    new LessonRequest(
      "Объясни статические свойства и методы в js",
      "Статические свойства и методы"
    ),
    new LessonRequest("Расскажи об instanceof в js", "instanceof"),
  ]
);

const lessonJS17 = new LessonItem(
  "Обработка ошибок",
  BasedJS,
  new LessonRequest("Расскажи об ошибках в js и как с ними работать"),
  [
    new LessonRequest("Объясни о try catch, покажи примеры", "try...catch"),
    new LessonRequest(
      "Расскажи про пользовательских ошибках, расширение базового класса Error",
      "Свои ошибки"
    ),
  ]
);

const lessonJS18 = new LessonItem(
  "Промисы",
  AdvancedJS,
  new LessonRequest("Расскажи об промисах в js"),
  [
    new LessonRequest(
      "Расскажи историю, почему были созданы промисы и какую проблему они решают",
      "История"
    ),
    new LessonRequest("Покажи примеры использования промисов", "Примеры"),
    new LessonRequest("Какие методы есть у промисов?", "Методы"),
    new LessonRequest(
      "Какие есть способы обработки ошибок в промисах?",
      "Обработка ошибок"
    ),
    new LessonRequest(
      "Расскажи о статических методах промисов, какие есть и для чего могут быть использованы",
      "Статические методы"
    ),
  ]
);

const lessonJS19 = new LessonItem(
  "async/await",
  AdvancedJS,
  new LessonRequest("Расскажи о синтаксисе async/await в js"),
  []
);

const lessonJS20 = new LessonItem(
  "Генераторы",
  AdvancedJS,
  new LessonRequest("Расскажи о генераторах в js"),
  [
    new LessonRequest("Как перебирать генераторы в js", "Перебор генераторов"),
    new LessonRequest("Как пользоваться yield в генераторах в js", "yield"),
    new LessonRequest("Объясни generator.throw в js", "generator.throw"),
    new LessonRequest(
      "Объясни Асинхронные генераторы в js",
      "Асинхронные генераторы"
    ),
  ]
);

const lessonJS21 = new LessonItem(
  "Proxy",
  AdvancedJS,
  new LessonRequest("Объясни что такое Proxy в js и покажи примеры"),
  [
    new LessonRequest("Объясни использование get c Proxy в js", "get"),
    new LessonRequest("Объясни использование set c Proxy в js", "set"),
    new LessonRequest("Объясни использование ownKeys c Proxy в js", "ownKeys"),
    new LessonRequest(
      "Объясни использование   deleteProperty c Proxy в js",
      "deleteProperty"
    ),
    new LessonRequest("Объясни использование has c Proxy в js", "has"),
    new LessonRequest("Объясни использование apply c Proxy в js", "apply"),
    new LessonRequest("Объясни работу Proxy c Map в js", "Map"),
    new LessonRequest("Объясни работу Proxy c Set в js", "Set"),
    new LessonRequest("Объясни Отключаемые прокси в js", "Отключаемые прокси"),
  ]
);

const lessonJS22 = new LessonItem(
  "Eval",
  AdvancedJS,
  new LessonRequest("Объясни что такое eval в js и покажи примеры"),
  [
    new LessonRequest(
      "Почему использовать eval бывает быть опасно в js",
      "Опасность eval"
    ),
  ]
);

const lessonJS23 = new LessonItem(
  "Каррирование",
  AdvancedJS,
  new LessonRequest("Объясни Каррирование в js и покажи примеры"),
  []
);

const lessonJS24 = new LessonItem(
  "Ссылочный тип",
  AdvancedJS,
  new LessonRequest("Объясни Ссылочный тип в js и покажи примеры"),
  [
    new LessonRequest(
      "Какие проблемы могут быть с  Ссылочным типом в js",
      "Проблемы с ссылочным типом"
    ),
  ]
);

const lessonJS25 = new LessonItem(
  "Побитовые операторы",
  AdvancedJS,
  new LessonRequest("Объясни побитовые операторы в js и покажи примеры"),
  [
    new LessonRequest(
      "Что такое двоичная система счисления",
      "Двоичная система"
    ),
    new LessonRequest("Что такое старший бит слева", "Старший бит слева"),
    new LessonRequest(
      "Какие есть побитовые операторы в js",
      "Побитовые операторы"
    ),
    new LessonRequest(
      "Объясни вспомогательные функции parseInt, toString в js",
      "parseInt, toString"
    ),
    new LessonRequest(
      "Как можно использовать побитовых операторов в работе в js",
      "Применение побитовых операторов"
    ),
  ]
);

const lessonJS26 = new LessonItem(
  "Юникод, внутреннее устройство строк",
  AdvancedJS,
  new LessonRequest("Как устроены строки в js?"),
  [
    new LessonRequest("Что такое Юникод?"),
    new LessonRequest("Объясни Суррогатные пары в js", "Суррогатные пары"),
    new LessonRequest(
      "Объясни Диакритические знаки и нормализация в js",
      "Диакритические знаки и нормализация"
    ),
  ]
);

const lessonJS27 = new LessonItem(
  "Intl: интернационализация",
  AdvancedJS,
  new LessonRequest("Что такое Intl в js и покажи примеры"),
  [
    new LessonRequest("Объясни Intl.Collator в js", "Строки, Intl.Collator"),
    new LessonRequest(
      "Объясни Intl.DateTimeFormat в js",
      "Даты, Intl.DateTimeFormat"
    ),
    new LessonRequest(
      "Объясни Intl.NumberFormat в js",
      "Числа, Intl.NumberFormat"
    ),
    new LessonRequest(
      "Методы в Date, String, Number с использованием локали",
      "Date, String, Number"
    ),
  ]
);

const lessonJS28 = new LessonItem(
  "Event loop",
  AdvancedJS,
  new LessonRequest("Объясни что такое Event loop в js"),
  [
    new LessonRequest("Какие есть фазы Event loop в js", "Фазы Event loop"),
    new LessonRequest("Объясни макротаски в js", "Макротаски"),
    new LessonRequest("Объясни микротаски в js", "Микротаски"),
    new LessonRequest(
      "В чем отличие макротасок и микротасок",
      "Отличие макротасок и микротасок"
    ),
  ]
);

const lessonJS29 = new LessonItem(
  "DOM-дерево",
  DOMJS,
  new LessonRequest("Объясни что такое DOM в js"),
  [
    new LessonRequest(
      "Как найти какой-то элемент в DOM? Какие есть методы для поиска в DOM?",
      "Поиск в DOM"
    ),
    new LessonRequest(
      "В чем отличия в querySelect, getElementById?",
      "Отличия Методов"
    ),
    new LessonRequest(
      "Объясни как работает метода matches в js при использовании его с DOM элементом",
      "matches"
    ),
    new LessonRequest("Объясни closest в js", "closest"),
  ]
);

const lessonJS30 = new LessonItem(
  "Свойства DOM элементов",
  DOMJS,
  new LessonRequest("Объясни какие есть свойства DOM элементов в js"),
  [
    new LessonRequest(
      "Обясни иерархию наследования DOM элементов",
      "Иерархия DOM элементов"
    ),
    new LessonRequest(
      "Объясни innerHTML и outerHTML в js",
      "innerHTML и outerHTML"
    ),
  ]
);

const lessonJS31 = new LessonItem(
  "Стили и классы",
  DOMJS,
  new LessonRequest(
    "Объясни как можно устанавливать стили DOM элементов через js"
  ),
  [
    new LessonRequest(
      "Объясни className и classList в DOM",
      "className и classList"
    ),
    new LessonRequest(
      "Как через style в js устанавливать стили DOM элементам?",
      "Свойство style"
    ),
    new LessonRequest(
      "Что делает метода getComputedStyle, покажи примеры использования в js",
      "getComputedStyle"
    ),
  ]
);

const lessonJS32 = new LessonItem(
  "Размеры и прокрутка элементов",
  DOMJS,
  new LessonRequest(
    "Объясни как можно получать размеры и прокрутку DOM элементов через js"
  ),
  [
    new LessonRequest(
      "Объясни offsetParent, offsetLeft, offsetTop в js",
      "offsetParent/Left/Top"
    ),
    new LessonRequest(
      "Объясни offsetWidth, offsetHeight в js",
      "offsetWidth/Height"
    ),
    new LessonRequest(
      "Объясни clientTop, clientLeft, clientWidth, clientHeight в js",
      "clientTop/Left/Width/Height"
    ),
    new LessonRequest(
      "Объясни scrollWidth, scrollHeight, scrollLeft, scrollTop в js",
      "scrollWidth/Height/Left/Top"
    ),
  ]
);

const lessonJS33 = new LessonItem(
  "Координаты",
  DOMJS,
  new LessonRequest("Объясни как можно управлять прокруткой страницы через js"),
  [
    new LessonRequest(
      "Как получить координаты относительно окна в js?",
      "Относительно окна"
    ),
    new LessonRequest(
      "Как получить координаты относительно документа?",
      "Относительно документа"
    ),
  ]
);

const lessonJS34 = new LessonItem(
  "События",
  DOMJS,
  new LessonRequest("Объясни события в js"),
  [
    new LessonRequest(
      "Какие есть способы навешивания событий на элементы",
      "Способы навешивания событий"
    ),
    new LessonRequest(
      "Объясни что такое объект события и покажи примеры использования",
      "Объект события"
    ),
  ]
);

const lessonJS35 = new LessonItem(
  "Всплытие и погружение",
  DOMJS,
  new LessonRequest(
    "Объясни что такое всплытие и погружение в js и покажи примеры"
  ),
  [
    new LessonRequest(
      "Объясни что такое всплытие в js, как отменить всплытие",
      "Всплытие"
    ),
    new LessonRequest(
      "Объясни что такое погружение в js, как им управлять",
      "Погружение"
    ),
    new LessonRequest(
      "Что такое делегирование событий и чем оно может быть полезно?",
      "Делегирование событий"
    ),
  ]
);

const lessonJS36 = new LessonItem(
  "Действия браузера по умолчанию",
  DOMJS,
  new LessonRequest("Объясни что действия браузера по умолчанию"),
  [
    new LessonRequest(
      "Как отменить действия действия браузера?",
      "Отмена действия браузера"
    ),
    new LessonRequest(
      "Объясни, что делает поция passive для addEventListener",
      "Опция «passive»"
    ),
  ]
);

const lessonJS37 = new LessonItem(
  "Пользовательские события",
  DOMJS,
  new LessonRequest("Объясни что пользовательские события в js"),
  [
    new LessonRequest(
      "Как создать пользовательское событие в js?",
      "Создание пользовательского события"
    ),
    new LessonRequest(
      "Покажи примеры использования пользовательских событий",
      "Примеры"
    ),
  ]
);

const lessonJS38 = new LessonItem(
  "События мыши",
  DOMJS,
  new LessonRequest("Объясни события мыши в js какие есть виды"),
  [
    new LessonRequest(
      "Расскажи про модификаторы shift, alt, ctrl и meta при события мыши",
      "shift, alt, ctrl и meta"
    ),
    new LessonRequest(
      "Расскажи про координаты clientX, clientY, pageX, pageY при событии мыши",
      "clientX/Y, pageX/Y"
    ),
    new LessonRequest("Обработка кнопок мыши в js", "Кнопки мыши"),
  ]
);

const lessonJS39 = new LessonItem(
  "Движение мыши",
  DOMJS,
  new LessonRequest("Объясни движение мыши"),
  [
    new LessonRequest(
      "Расскажи о событиях mouseover и mouseout",
      "mouseover/mouseout"
    ),
    new LessonRequest(
      "Расскажи о событиях mouseover и mouseout",
      "mouseenter/mouseleave"
    ),
    new LessonRequest(
      "В чем отличие mouseenter/mouseleave и mouseover/mouseout",
      "Отличие mouseover/out и mouseenter/leave"
    ),
  ]
);

const lessonJS40 = new LessonItem(
  "Клавиатура",
  DOMJS,
  new LessonRequest("Расскажи о события keydown и keyup в js"),
  [
    new LessonRequest("Расскажи подробнее о событии keydown", "keydown"),
    new LessonRequest("Расскажи подробнее о событии keyup", "keyup"),
  ]
);

const lessonJS41 = new LessonItem(
  "Pointer события",
  DOMJS,
  new LessonRequest("Расскажи о pointer событиях в js, перечисли их всех"),
  [
    new LessonRequest(
      "Расскажи о Мульти-таче с pointer собоытиях в js",
      "Мульти-тач"
    ),
  ]
);

const lessonJS42 = new LessonItem(
  "Прокрутка",
  DOMJS,
  new LessonRequest("Расскажи о событиях прокрутки в js"),
  []
);

const lessonJS43 = new LessonItem(
  "Формы",
  DOMJS,
  new LessonRequest("Расскажи о свойствах и методах формы в js"),
  [
    new LessonRequest("Расскажи о событиях focus и blur в js", "focus/blur"),
    new LessonRequest(
      "Расскажи о событиях change и input в js",
      "change/input"
    ),
    new LessonRequest(
      "Расскажи о событиях cut, copy, paste в js",
      "cut, copy, paste"
    ),
    new LessonRequest("Расскажи о событии submit в js", "submit"),
  ]
);

const lessonJS44 = new LessonItem(
  "Загрузка документа",
  DOMJS,
  new LessonRequest("Расскажи о событиях загрузки страницы в js"),
  [
    new LessonRequest(
      "Расскажи о событии DOMContentLoaded",
      "DOMContentLoaded"
    ),
    new LessonRequest(
      "Расскажи о событиях load, beforeunload, unload ",
      "load,beforeunload,unload"
    ),
  ]
);

const lessonJS45 = new LessonItem(
  "Скрипты",
  DOMJS,
  new LessonRequest("Расскажи о событиях загрузки страницы в js"),
  [
    new LessonRequest("Расскажи об атрибуте defer в js", "defer"),
    new LessonRequest("Расскажи об async в js", "async"),
    new LessonRequest(
      "Расскажи о динамически загружаемых скриптах",
      "Динамические скрипты"
    ),
  ]
);

const lessonJS46 = new LessonItem(
  "Загрузка ресурсов",
  DOMJS,
  new LessonRequest("Расскажи о загрузка ресурсов в js"),
  [
    new LessonRequest("Расскажи о событии load js", "load"),
    new LessonRequest("Расскажи о событии error в js", "error"),
    new LessonRequest(
      "Расскажи о загрузке скриптов и изображения",
      "Загрузка разных ресурсов"
    ),
  ]
);

const lessonJS47 = new LessonItem(
  "MutationObserver",
  DOMJS,
  new LessonRequest("Расскажи о MutationObserver в js"),
  [
    new LessonRequest(
      "Покажи примеры использования MutationObserver в js",
      "Примеры"
    ),
  ]
);

const lessonJS48 = new LessonItem(
  "IntersectionObserver",
  DOMJS,
  new LessonRequest("Расскажи о IntersectionObserver в js"),
  [
    new LessonRequest(
      "Покажи примеры использования IntersectionObserver в js",
      " Примеры"
    ),
  ]
);

const lessonJS49 = new LessonItem(
  "Selection и Range",
  DOMJS,
  new LessonRequest("Расскажи об классах Selection и Range в js"),
  [
    new LessonRequest(
      "Расскажи подробнее об объекте Selection в js",
      "Selection"
    ),
    new LessonRequest("Расскажи подробнее об объекте Range в js", "Range"),
    new LessonRequest(
      "Как сделать что-то невыделяемым в js и html",
      "Сделать что-то невыделяемым"
    ),
  ]
);

export const lessonsJs = [
  lessonJS1,
  lessonJS2,
  lessonJS3,
  lessonJS4,
  lessonJS5,
  lessonJS6,
  lessonJS7,
  lessonJS8,
  lessonJS9,
  lessonJS10,
  lessonJS11,
  lessonJS12,
  lessonJS13,
  lessonJS14,
  lessonJS15,
  lessonJS16,
  lessonJS17,
  lessonJS18,
  lessonJS19,
  lessonJS20,
  lessonJS21,
  lessonJS22,
  lessonJS23,
  lessonJS24,
  lessonJS25,
  lessonJS26,
  lessonJS27,
  lessonJS28,
  lessonJS29,
  lessonJS30,
  lessonJS31,
  lessonJS32,
  lessonJS33,
  lessonJS34,
  lessonJS35,
  lessonJS36,
  lessonJS37,
  lessonJS38,
  lessonJS39,
  lessonJS40,
  lessonJS41,
  lessonJS42,
  lessonJS43,
  lessonJS44,
  lessonJS45,
  lessonJS46,
  lessonJS47,
  lessonJS48,
  lessonJS49,
];
