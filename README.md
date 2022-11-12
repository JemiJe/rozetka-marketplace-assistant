# rozetka marketplace assistant
**tampermonkey скрипт который упрощает и ускоряет обработку и проверку товаров, особенно привязку разных параметров**<br>
<sub>*(написан ужасно, впопыхах, но работал. с возможными  обновлениями rozetka splitter может сейчас и не работать. возможно в splitter добавили все то что этот скрипт пытался упростить)*</sub><br>
для работы нужно скачать расширения для браузера: `tampermonkey` и `stylus` (или другой подобный для пользовательских стилей)<br>
1. вставить целиком скрипт в новый скрипт `tampermonkey` (dashboard => [+] => Ctrl+A => Ctrl+V)
2. содержимое файла `allStylusStyles+Assistant.css` нужно бросить в стили расширение `stylus` для браузера. стили значительно упрощают навигацию и выделяют цветом все важное<br>
скрипт нормально работает в chrome, в других не проверялся<br>

## (неполная) инструкция по определенным фичам

`start autopagination` - полезно когда есть 100-200 страниц и где-то в одной из них есть один непривязанный параметр. при отмеченном checkbox остановится если найдет непривязанный параметр

### FILLER (автозаполнение полей параметров, появляется в окне заполнения параметров слева)
`несколько значений` - берет строку целиком и сравнивает есть ли опция в строке или есть ли строка в опции. можно и нужно иногда использовать и для одиночных опций (где выбор только один)<br>

`неск. знач. (по каждому слову/фразе) `- разбивает строку по символам `(,.;|)` и для каждой такой подстроки ищет точно соответствие опции один в один (без учета регистра)<br>

checkbox `часть текста после ":"` - работает для `неск. знач. (по каждому слову/фразе)`. Превращает строку "Другие цвета: Хаки, Другие цвета: Красный" => "Хаки Красный" для функции `неск. знач. (по каждому слову/фразе)`<br>

checkbox `часть слова (опции)` - по умолчанию делит значение каждой опции пополам<br>
input `% от слова в списках` - указать процент от слова опции для checkbox `часть слова (опции)`<br>

checkbox `не точный режим` для кнопки (`по каждой фразе...`), работает как `несколько значений`, но для каждой подстроки изначальной строки (см. `неск. знач. (по каждому слову/фразе)` )<br>

#### FILLER CHANGE (изменяет исходные input в окне параметров)
`отбросить ед. измерения только` - удаляет все символы кроме чисел и (-,.)  и после этого можно автозаполнить<br>
`взять часть после ":"` - запускает аналогичную функцию `часть текста после ":"`, но заменяет текст в самом input

### ANALYZER (проверка соответствия названия товара, описания и характеристик в измененных товарах)(верхнее меню)
при совпадении выделяет зеленым, иначе - красным.<br>
преимущественно заточен на одежду, где 2 главных параметра размер/рост и цвет. в остальных товарах может глючить. включена автоподмена размеров где есть кириллица (так как в основном вместо латинских X,M,C... всегда, как на зло, вставляют кириллицу). размеры через `х`, габариты, пишутся везде коряво и пока нет возможности их нормально просеять.<br>
чекбокс деления значения по пробелу в некоторых случаях приводит к зависанию.

### ДРУГОЕ
сохранение отклоненных всех по задаче:
1. при активации кнопки подтвердить  когда товар раскрыт и перекрыт серым фоном `отклонить`
2. при нажатии  кнопки `отклонить выбранные` - добавляет в хранилище выбранные отклоненные (могут быть и не раскрыты)<br>
`очистить localstorage` - очистить localstorage от всех сохраненных айди по задачам (что бы для наглядности оставить там все что необходимо)

## ПРИМЕРЫ:
### ДРУГИЕ ФУНКЦИИ
`получить айди выделенных` - только отклоненные - работает только для открытых товаров (ищет по плейсхолдеру "отправлено в обработку")

### FILLER
взять все что после и до `(,.;|)`: "Другие цвета: Хаки, Другие цвета: Красный"<br>
`заменить все символы` принимает regex<br>
примеры некоторых замен для `заменить все символы (последовательно)`: (принимает regex, сохраняет ранее введенные значения)<br>
```
( x _x| х _x|,_ мм,|$_ мм)
[123456]-й USB [xх]_|А_A
1,_1 год,|1.5,_1.5 года,|2,_2 года,|2.5,_2.5 года,|3,_3 года,|3.5,_3.5 года,|4,_4 года,|5,_5 лет,|6,_6 лет,|7,_7 лет,|8,_8 лет,|9,_9 лет,|10,_10 лет,|11,_11 лет,|12,_12 лет,
і_и
```