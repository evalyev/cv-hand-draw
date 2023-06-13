# cv-hand-draw
Веб-приложение для рисования указательным пальцем с веб-камеры на виртуальной доске. Приложение написано на react.

## Запустить проект
Важно запускать проект через Google Chrome (в safari пока что работает плохо)
Перейти по ссылке - https://evalyev.github.io/cv-hand-draw/

<img alt="Подождите, гифка прогружается" src="src/images/preview.gif"></img>

## Метрики
Обучили простую модель и сравнили эту модель с opensource моделью по распознаванию позы руки от mediapipe. <br>
Использовали датасет <a href="http://domedb.perception.cs.cmu.edu/handdb.html">Hand Keypoint Detection in Single Images using Multiview Bootstrapping</a>. <br>
В качестве метрики взяли Евклидово расстояние. 
Модель | Евклидово расстояние
--- | --- 
mobilenetv2_050 | 0.291 
mediapipe | 1.257

Несмотря на высокое значение евклидового расстояния, модель mediapipe наглядно лучше предсказывает ключевые точки позы руки, поэтому было принято решение использовать модель mediapipe в инференсе. Инференс доступен по ссылке - https://evalyev.github.io/cv-hand-draw/
