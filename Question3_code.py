#On s'est contenté que d'un exemple mais on aurait pu le faire de facon général mais cela aurait été plus long
#Nous tenons à souligner également que par erreur nous ne sommes pas partis de la même version du dataset
@app.route('/consensus/', methods=['get'])
def concensus():
  response_eliot = requests.get("http://127.0.0.1:5000//predict?pclass=1&sex=0&age=25&sibsp=1&parch=0&fare=50&body=10")
  data_eliot = response_eliot.json()
  predict_eliot = data_eliot["predict"]
  response_cecilia = requests.get("https://af06-2a01-e34-ec63-3510-c5b0-a263-d931-75a5.ngrok-free.app/predict_survival?pclass=1&sex=0&age=25&sibsp=1&parch=0&fare=50&embarked=1&class=2&who=1&adult_male=0&deck=3&embark_town=1&alive=1&alone=0")
  data_cecilia = response_cecilia.json()
  predict_cecilia = data_cecilia["prediction"]
        
  mean = np.mean([int(predict_cecilia),int(predict_eliot)])
  data = {'mean': str(mean)}
  return jsonify(data)
