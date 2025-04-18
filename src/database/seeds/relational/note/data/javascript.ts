import { NoteContent } from '../note-seed.service';

export const jsContents: NoteContent[] = [
  {
    question: 'Что такое замыкание (closure) в JavaScript?',
    answer:
      'Замыкание — это комбинация функции и лексического окружения, в котором эта функция была определена. Замыкание позволяет функции сохранять доступ к переменным из внешней области видимости даже после завершения выполнения этой области.',
    tags: ['javascript', 'функции', 'программирование'],
  },
  {
    question: 'Что такое Event Loop в JavaScript?',
    answer:
      'Event Loop (цикл событий) — это механизм, который позволяет JavaScript работать асинхронно, несмотря на наличие только одного потока. Он постоянно проверяет, есть ли задачи в очереди задач (task queue), и если call stack пуст, берет задачу из очереди и помещает её в call stack для выполнения.',
    tags: ['javascript', 'асинхронность', 'программирование'],
  },
  {
    question: 'Что такое прототипное наследование в JavaScript?',
    answer:
      'Прототипное наследование — это механизм наследования в JavaScript, при котором объекты наследуют свойства и методы от своих прототипов. Каждый объект в JavaScript имеет внутреннюю ссылку на другой объект, называемый его прототипом. Если свойство не найдено в самом объекте, JavaScript ищет его в прототипе, затем в прототипе прототипа и так далее.',
    tags: ['javascript', 'ООП', 'наследование', 'программирование'],
  },
  {
    question: 'Что такое hoisting (подъём) в JavaScript?',
    answer:
      'Hoisting (подъём) — это механизм в JavaScript, при котором объявления переменных и функций "поднимаются" в начало их области видимости перед выполнением кода. Это означает, что вы можете использовать переменную или функцию до её объявления в коде. Однако для переменных, объявленных через var, поднимается только объявление, а не инициализация.',
    tags: ['javascript', 'переменные', 'программирование'],
  },
  {
    question: 'Что такое Promise в JavaScript?',
    answer:
      'Promise (обещание) — это объект, представляющий будущий результат асинхронной операции. Promise может находиться в одном из трёх состояний: pending (ожидание), fulfilled (выполнено) или rejected (отклонено). Promise используются для управления асинхронными операциями и обработки их результатов.',
    tags: ['javascript', 'асинхронность', 'промисы', 'программирование'],
  },
  {
    question: 'Что такое async/await в JavaScript?',
    answer:
      'async/await — это синтаксический сахар для работы с промисами в JavaScript. Функция, помеченная ключевым словом async, всегда возвращает Promise. Ключевое слово await используется внутри async-функций для приостановки выполнения до завершения Promise, и возвращает его результат.',
    tags: ['javascript', 'асинхронность', 'async/await', 'программирование'],
  },
  {
    question: 'Что такое this в JavaScript?',
    answer:
      'this — это ключевое слово, которое ссылается на контекст выполнения функции. Значение this зависит от того, как функция вызывается: в глобальном контексте, как метод объекта, через call/apply/bind, как обработчик события и т.д.',
    tags: ['javascript', 'this', 'контекст', 'программирование'],
  },
  {
    question: 'Что такое стрелочные функции (arrow functions) в JavaScript?',
    answer:
      'Стрелочные функции — это компактный синтаксис для определения функций в JavaScript, введенный в ES6. Они имеют более короткий синтаксис и не имеют собственного this, arguments, super или new.target. Вместо этого, стрелочные функции захватывают значение this из окружающего контекста.',
    tags: ['javascript', 'функции', 'ES6', 'программирование'],
  },
  {
    question: 'Что такое деструктуризация в JavaScript?',
    answer:
      'Деструктуризация — это выражение JavaScript, которое позволяет извлекать данные из массивов или объектов в отдельные переменные. Например: const { name, age } = person; или const [first, second] = array;',
    tags: ['javascript', 'синтаксис', 'ES6', 'программирование'],
  },
  {
    question: 'Что такое спред-оператор (spread operator) в JavaScript?',
    answer:
      'Спред-оператор (...) позволяет разворачивать массивы или объекты, где ожидается набор элементов. Он используется для копирования массивов или объектов, объединения массивов или объектов, передачи аргументов в функции и т.д.',
    tags: ['javascript', 'синтаксис', 'ES6', 'программирование'],
  },
  {
    question: 'Что такое модули в JavaScript?',
    answer:
      'Модули в JavaScript — это механизм для разделения кода на отдельные файлы с собственной областью видимости. Современный JavaScript использует синтаксис import/export для работы с модулями. Модули помогают организовать код, управлять зависимостями и предотвращать засорение глобальной области видимости.',
    tags: ['javascript', 'модули', 'ES6', 'программирование'],
  },
  {
    question: 'Что такое замыкание (closure) в JavaScript?',
    answer:
      'Замыкание — это функция, которая имеет доступ к переменным из внешней функции, даже после того, как внешняя функция завершила выполнение.',
    tags: ['javascript', 'функции', 'программирование'],
  },
  {
    question: 'Объясните разницу между var, let и const в JavaScript',
    answer:
      'var — имеет функциональную область видимости, поднимается (hoisted) и может быть переопределен. let — имеет блочную область видимости, не поднимается и может быть переопределен. const — имеет блочную область видимости, не поднимается и не может быть переопределен, но свойства объектов, объявленных с const, могут быть изменены.',
    tags: ['javascript', 'переменные', 'ES6', 'программирование'],
  },
  {
    question: 'Что такое глубокое и поверхностное копирование в JavaScript?',
    answer:
      'Поверхностное копирование создает новый объект, но копирует ссылки на вложенные объекты (Object.assign(), spread-оператор). Глубокое копирование создает новый объект и рекурсивно копирует все вложенные объекты (JSON.parse(JSON.stringify()), structuredClone(), библиотеки типа lodash).',
    tags: ['javascript', 'объекты', 'копирование', 'программирование'],
  },
  {
    question: 'Что такое === и == в JavaScript?',
    answer:
      '=== — оператор строгого равенства, сравнивает значения без преобразования типов. == — оператор нестрогого равенства, пытается преобразовать операнды к одному типу перед сравнением.',
    tags: ['javascript', 'операторы', 'программирование'],
  },
  {
    question: 'Что такое функции высшего порядка в JavaScript?',
    answer:
      'Функции высшего порядка — это функции, которые принимают другие функции в качестве аргументов или возвращают их. Примеры: map(), filter(), reduce(), forEach().',
    tags: [
      'javascript',
      'функции',
      'функциональное программирование',
      'программирование',
    ],
  },
  {
    question: 'Что такое прототип объекта в JavaScript?',
    answer:
      'Прототип объекта — это объект, от которого другой объект наследует свойства и методы. В JavaScript каждый объект имеет внутреннее свойство [[Prototype]], которое ссылается на его прототип. Вы можете получить прототип объекта с помощью Object.getPrototypeOf() или свойства __proto__.',
    tags: ['javascript', 'ООП', 'прототипы', 'программирование'],
  },
  {
    question: 'Что такое Promise.all() в JavaScript?',
    answer:
      'Promise.all() — это метод, который принимает массив промисов и возвращает новый промис, который выполняется, когда все промисы в массиве выполнены, или отклоняется, если хотя бы один из промисов отклонен.',
    tags: ['javascript', 'асинхронность', 'промисы', 'программирование'],
  },
  {
    question: 'Что такое колбэк-функция (callback) в JavaScript?',
    answer:
      'Колбэк-функция — это функция, которая передается в другую функцию в качестве аргумента и вызывается внутри внешней функции для выполнения определенного действия.',
    tags: ['javascript', 'функции', 'асинхронность', 'программирование'],
  },
  {
    question: 'Что такое REST параметры в JavaScript?',
    answer:
      'REST параметры (...args) позволяют функции принимать неопределенное количество аргументов в виде массива. Они обозначаются префиксом ... в параметрах функции.',
    tags: ['javascript', 'функции', 'ES6', 'программирование'],
  },
  {
    question: 'Что такое Set в JavaScript?',
    answer:
      'Set — это коллекция уникальных значений любого типа. Элементы в Set могут быть как примитивами, так и объектами.',
    tags: ['javascript', 'коллекции', 'ES6', 'программирование'],
  },
  {
    question: 'Что такое Map в JavaScript?',
    answer:
      'Map — это коллекция пар ключ-значение, где ключи могут быть любого типа, в отличие от объектов, где ключи могут быть только строками или символами.',
    tags: ['javascript', 'коллекции', 'ES6', 'программирование'],
  },
  {
    question: 'Что такое Symbol в JavaScript?',
    answer:
      'Symbol — это примитивный тип данных, который представляет уникальный идентификатор. Каждый символ, созданный с помощью Symbol(), уникален и не равен никакому другому символу.',
    tags: ['javascript', 'типы данных', 'ES6', 'программирование'],
  },
  {
    question: 'Что такое генераторы в JavaScript?',
    answer:
      'Генераторы — это функции, которые могут приостанавливать свое выполнение, а затем возвращаться к нему в той же точке. Они объявляются с помощью function* и используют yield для возврата значений и приостановки выполнения.',
    tags: ['javascript', 'функции', 'ES6', 'программирование'],
  },
  {
    question: 'Что такое DOM в JavaScript?',
    answer:
      'DOM (Document Object Model) — это программный интерфейс для HTML и XML документов. Он представляет страницу в виде дерева узлов, что позволяет программам изменять структуру, стиль и содержимое документа.',
    tags: ['javascript', 'DOM', 'браузер', 'программирование'],
  },
  {
    question: 'Что такое IIFE в JavaScript?',
    answer:
      'IIFE (Immediately Invoked Function Expression) — это функция, которая выполняется сразу после её создания. Она обычно используется для создания новой области видимости и предотвращения загрязнения глобальной области видимости.',
    tags: ['javascript', 'функции', 'паттерны', 'программирование'],
  },
  {
    question: 'Что такое Virtual DOM в React?',
    answer:
      'Virtual DOM — это легковесная копия реального DOM в памяти. React создает и обновляет Virtual DOM, а затем сравнивает его с реальным DOM, чтобы определить, какие части страницы нуждаются в обновлении.',
    tags: ['javascript', 'react', 'virtual dom', 'программирование'],
  },
  {
    question: 'Что такое WebSockets?',
    answer:
      'WebSockets — это протокол связи, который обеспечивает полнодуплексный канал связи через одно TCP-соединение. В отличие от HTTP, WebSockets позволяют установить постоянное соединение между клиентом и сервером, что позволяет обмениваться данными в режиме реального времени.',
    tags: ['javascript', 'websockets', 'сеть', 'программирование'],
  },
  {
    question: 'Что такое localStorage в JavaScript?',
    answer:
      'localStorage — это свойство объекта window, которое позволяет сохранять данные в браузере пользователя без срока действия. Данные будут доступны даже после закрытия браузера и сохраняются между сеансами браузера.',
    tags: ['javascript', 'хранение данных', 'браузер', 'программирование'],
  },
  {
    question: 'Что такое sessionStorage в JavaScript?',
    answer:
      'sessionStorage — это свойство объекта window, которое позволяет сохранять данные в браузере пользователя на время сессии. Данные удаляются при закрытии вкладки или окна браузера.',
    tags: ['javascript', 'хранение данных', 'браузер', 'программирование'],
  },
  {
    question: 'Что такое JSON в JavaScript?',
    answer:
      'JSON (JavaScript Object Notation) — это формат обмена данными, основанный на синтаксисе объектов JavaScript. JSON легко читается человеком и легко анализируется компьютером. В JavaScript есть встроенные методы JSON.parse() и JSON.stringify() для работы с JSON.',
    tags: ['javascript', 'json', 'формат данных', 'программирование'],
  },
  {
    question: 'Что такое AJAX в JavaScript?',
    answer:
      'AJAX (Asynchronous JavaScript and XML) — это набор методов веб-разработки, использующих технологии на стороне клиента для создания асинхронных веб-приложений. С помощью AJAX веб-приложения могут отправлять и получать данные с сервера асинхронно, без перезагрузки страницы.',
    tags: ['javascript', 'ajax', 'асинхронность', 'программирование'],
  },
  {
    question: 'Что такое метод fetch() в JavaScript?',
    answer:
      'fetch() — это современный API для выполнения сетевых запросов, который возвращает Promise, разрешающийся в объект Response. fetch() более гибкий и мощный, чем старый XMLHttpRequest, и является частью стандарта.',
    tags: ['javascript', 'сеть', 'асинхронность', 'программирование'],
  },
  {
    question: 'Что такое классы в JavaScript?',
    answer:
      'Классы в JavaScript, введенные в ES6, являются синтаксическим сахаром над существующим прототипным наследованием. Они предоставляют более чистый и понятный способ создания объектов и организации наследования.',
    tags: ['javascript', 'классы', 'ООП', 'ES6', 'программирование'],
  },
  {
    question: 'Что такое метод Array.prototype.reduce() в JavaScript?',
    answer:
      'reduce() — это метод массивов, который выполняет функцию-редуктор для каждого элемента массива, накапливая результат в одном значении. Он принимает функцию-редуктор и начальное значение аккумулятора.',
    tags: [
      'javascript',
      'массивы',
      'функциональное программирование',
      'программирование',
    ],
  },
  {
    question: 'Что такое замыкания и зачем они нужны в JavaScript?',
    answer:
      'Замыкания позволяют функциям запоминать и получать доступ к своему лексическому окружению даже после того, как функция выполнена. Они используются для создания приватных переменных, фабричных функций, каррирования и других паттернов программирования.',
    tags: ['javascript', 'замыкания', 'функции', 'программирование'],
  },
  {
    question: 'Что такое TypeScript?',
    answer:
      'TypeScript — это язык программирования, разработанный Microsoft, который является надмножеством JavaScript. Он добавляет статическую типизацию к JavaScript, что помогает обнаруживать ошибки на этапе компиляции и улучшает опыт разработки через лучшую документацию и автодополнение.',
    tags: ['typescript', 'javascript', 'типизация', 'программирование'],
  },
];
