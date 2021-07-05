THREE.ImageUtils.crossOrigin = "*";

var demo;
(function(demo) {
  /**
   * BasicView は、Three.js のプロジェクトを簡単にセットアップすることができるクラスです。
   * シーン、カメラ、レンダラー、ビューポートのシンプルなテンプレートを提供しています。
   * @author Yausunobu Ikeda a.k.a @clockmaker
   * @class demo.BasicView
   */
  var BasicView = (function() {
    function BasicView() {
        var _this = this;
        this.containerElement = document.createElement('div');
        document.body.appendChild(this.containerElement);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 200000);
        this.camera.position.z = -1000;
        // アンチエイリアス設定有無
        var needAntialias = window.devicePixelRatio == 1.0;
        this.renderer = new THREE.WebGLRenderer({
          antialias: needAntialias
        });
        this.renderer.setClearColor(0x0);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.containerElement.appendChild(this.renderer.domElement);
        window.addEventListener('resize', function(e) {
          _this.handleResize(e);
        }, false);
      }
      /**
       * ウインドウリサイズ時のイベントハンドラーです。
       * @param event
       */
    BasicView.prototype.handleResize = function(event) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    /**
     * レンダリングを開始します。
     */
    BasicView.prototype.startRendering = function() {
      this.update();
    };
    /**
     * requestAnimationFrame で呼び出されるメソッドです。
     * @private
     */
    BasicView.prototype.update = function() {
      requestAnimationFrame(this.update.bind(this));
      this.onTick();
      this.render();
    };
    /**
     * レンダリングを即座に実行します。
     */
    BasicView.prototype.render = function() {
      this.renderer.render(this.scene, this.camera);
    };
    /**
     * 毎フレーム実行される関数です。
     */
    BasicView.prototype.onTick = function() {};
    return BasicView;
  })();
  demo.BasicView = BasicView;
})(demo || (demo = {}));

var __extends = this.__extends || function(d, b) {
  for (var p in b)
    if (b.hasOwnProperty(p)) d[p] = b[p];

  function __() {
    this.constructor = d;
  }
  __.prototype = b.prototype;
  d.prototype = new __();
};

var demo;
(function(demo) {
  var FONT_NAME = "Source Code Pro";
  /**
   * 3Dのパーティクル表現のデモクラスです。プリロードしてから実行します。
   * @author Yausnobu Ikeda a.k.a clockmaker
   */
  var DemoIconsPreload = (function() {
    function DemoIconsPreload() {
      // ウェブフォントのロードを待ってから初期化
      WebFont.load({
        custom: {
          families: ['Source Code Pro', 'FontAwesome'],
          urls: [
            'https://fonts.googleapis.com/css?family=Source+Code+Pro:600',
            'https://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css'
          ],
          testStrings: {
            'FontAwesome': '\uf001'
          }
        },
        // Web Fontが使用可能になったとき
        active: function() {
          new DemoIconsWorld();
        }
      });
    }
    return DemoIconsPreload;
  })();
  demo.DemoIconsPreload = DemoIconsPreload;
  /**
   * 3Dのパーティクル表現のクラスです。
   * @author Yausnobu Ikeda a.k.a clockmaker
   */
  var DemoIconsWorld = (function(_super) {
    __extends(DemoIconsWorld, _super);

    function DemoIconsWorld() {
        _super.call(this);
        this.CANVAS_W = 160;
        this.CANVAS_H = 40;
        this.WORD_LIST = ["増田龍備", "渡邉泰貴", "八木智秋","廣河拓実","三浦和音"];
        this._matrixLength = 8;
        this._particleList = [];
        this._wordIndex = 0;
        /** 色相 0.0〜1.0 */
        this._hue = 0.6;
        this.HELPER_ZERO = new THREE.Vector3(0, 0, 0);
        this.setup();
        this.createLogo();
        this.startRendering();
      }
      /**
       * セットアップします。
       */
    DemoIconsWorld.prototype.setup = function() {
      // ------------------------------
      // カメラの配置
      // ------------------------------
      this.camera.far = 100000;
      this.camera.near = 1;
      this.camera.position.z = 5000;
      this.camera.lookAt(this.HELPER_ZERO);

      // ------------------------------
      // 背景の作成
      // ------------------------------
      var plane = new THREE.PlaneBufferGeometry(50000, 50000, 1, 1);
      var mat = new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture('http://ics-web.jp/lab-data/150601_threejs_mosaic/imgs/bg.png')
      });
      var bg = new THREE.Mesh(plane, mat);
      bg.position.z = -10000;
      this.scene.add(bg);
      this._bg = bg;

      // ------------------------------
      // 3D空間のパーツを配置
      // ------------------------------
      var light = new THREE.DirectionalLight(0xffffff);
      light.position.set(0, 1, +1).normalize();
      this.scene.add(light);
      // particle motion
      this._wrap = new THREE.Object3D();
      this.scene.add(this._wrap);
      // ------------------------------
      // パーティクルのテクスチャアトラスを生成
      // ------------------------------
      var container = new createjs.Container();
      var SIZE = 256;
      for (var i = 0, len = this._matrixLength * this._matrixLength; i < len; i++) {
        var char = String.fromCharCode(61730 + i);
        var text2 = new createjs.Text(char, "200px FontAwesome", "#FFF");
        text2.textBaseline = "middle";
        text2.textAlign = "center";
        text2.x = SIZE * (i % this._matrixLength) + SIZE / 2;
        text2.y = SIZE * Math.floor(i / this._matrixLength) + SIZE / 2;
        container.addChild(text2);
      }
      container.cache(0, 0, SIZE * this._matrixLength, SIZE * this._matrixLength);
      var cacheUrl = container.getCacheDataURL();
      var image = new Image();
      image.src = cacheUrl;
      var texture = new THREE.Texture(image);
      texture.needsUpdate = true;
      // ------------------------------
      // パーティクルの作成
      // ------------------------------
      var ux = 1 / this._matrixLength;
      var uy = 1 / this._matrixLength;
      this._particleList = [];
      for (var i = 0; i < this.CANVAS_W; i++) {
        for (var j = 0; j < this.CANVAS_H; j++) {
          var ox = (this._matrixLength * Math.random()) >> 0;
          var oy = (this._matrixLength * Math.random()) >> 0;
          var geometry = new THREE.PlaneGeometry(40, 40, 1, 1);
          this.change_uvs(geometry, ux, uy, ox, oy);
          var material = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
          });
          material.blending = THREE.AdditiveBlending;
          var word = new THREE.Mesh(geometry, material);
          this._wrap.add(word);
          this._particleList.push(word);
        }
      }
      this.createParticleCloud();
    };
    DemoIconsWorld.prototype.createParticleCloud = function() {
      // 形状データを作成
      var geometry = new THREE.Geometry();
      var numParticles = 50000;
      var SIZE = 10000;
      for (var i = 0; i < numParticles; i++) {
        geometry.vertices.push(new THREE.Vector3(SIZE * (Math.random() - 0.5), SIZE * (Math.random() - 0.5), SIZE * (Math.random() - 0.5)));
      }
      // マテリアルを作成
      var texture = THREE.ImageUtils.loadTexture('http://ics-web.jp/lab-data/150601_threejs_mosaic/imgs/fire_particle.png');
      var material = new THREE.PointCloudMaterial({
        size: 30,
        color: 0x444444,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthTest: false,
        map: texture
      });
      // 物体を作成
      var mesh = new THREE.PointCloud(geometry, material);
      mesh.position = new THREE.Vector3(0, 0, 0);
      this.scene.add(mesh);
    };
    /**
     * ロゴを生成し、モーションします。
     */
    DemoIconsWorld.prototype.createLogo = function() {
      var _this = this;
      // レターオブジェクトを生成します。
      var canvas = document.createElement("canvas");
      canvas.setAttribute("width", this.CANVAS_W + "px");
      canvas.setAttribute("height", this.CANVAS_H + "px");
      var stage = new createjs.Stage(canvas);
      var text1 = new createjs.Text(this.WORD_LIST[this._wordIndex], "30px " + FONT_NAME, "#FFF");
      this._wordIndex++;
      if (this._wordIndex >= this.WORD_LIST.length) {
        this._wordIndex = 0;
      }
      text1.textAlign = "center";
      text1.x = this.CANVAS_W / 2;
      stage.addChild(text1);
      stage.update();
      var timeline = new TimelineMax({
        onComplete: function() {
          var tm = new TimelineMax();
          tm.to("#coverBlack", 1.0, {
            css: {
              opacity: 1.0
            }
          });
          tm.call(function() {
            _this.createLogo();
          });
        }
      });
      var ctx = canvas.getContext("2d");
      for (var i = 0; i < this._particleList.length; i++) {
        this._particleList[i].visible = false;
      }
      // 透過領域を判定する
      var pixcelColors = ctx.getImageData(0, 0, this.CANVAS_W, this.CANVAS_H).data;
      var existDotList = [];
      var existDotCount = 0;
      for (var i = 0; i < this.CANVAS_W; i++) {
        existDotList[i] = [];
        for (var j = 0; j < this.CANVAS_H; j++) {
          // 透過しているか判定
          var flag = (pixcelColors[(i + j * this.CANVAS_W) * 4 + 3] == 0);
          existDotList[i][j] = flag;
          if (flag == true)
            existDotCount++;
        }
      }
      // レターのモーションを作成する
      var cnt = 0;
      var max = this.CANVAS_W * this.CANVAS_H;
      for (var i = 0; i < this.CANVAS_W; i++) {
        for (var j = 0; j < this.CANVAS_H; j++) {
          // 透過していたらパスする
          if (existDotList[i][j] == true)
            continue;
          var word = this._particleList[cnt];
          word.material.color.setHSL(this._hue + ((i * canvas.height / max) - 0.5) * 0.2, 0.5, 0.6 + 0.4 * Math.random());
          word.material.blending = THREE.AdditiveBlending;
          this._wrap.add(word);
          var toObj = {
            x: (i - canvas.width / 2) * 30,
            y: (canvas.height / 2 - j) * 30,
            z: 0
          };
          var fromObj = {
            x: 2000 * (Math.random() - 0.5) - 500,
            y: 1000 * (Math.random() - 0.5),
            z: +10000
          };
          word.position.x = fromObj.x;
          word.position.y = fromObj.y;
          word.position.z = fromObj.z;
          var toRotationObj = {
            z: 0
          };
          var fromRotationObj = {
            z: 10 * Math.PI * (Math.random() - 0.5)
          };
          word.rotation.z = fromRotationObj.z;
          var delay = (Cubic.easeInOut).getRatio(cnt / 1600) * 3.0 + 1.5 * Math.random();
          timeline.to(word.rotation, 6.0, {
            z: toRotationObj.z,
            ease: Cubic.easeInOut
          }, delay);
          //
          word.visible = false;
          timeline.set(word, {
            visible: true
          }, delay);
          timeline.to(word.position, 7.0, {
            bezier: [
              fromObj, {
                x: (0 + toObj.x) / 2 + 300,
                y: (fromObj.y + toObj.y) / 2 + 500 * Math.random(),
                z: (fromObj.z + toObj.z) / 2
              },
              toObj
            ],
            delay: delay / 1.0,
            ease: Expo.easeInOut
          }, 0);
          cnt++;
        }
      }
      this._wrap.position.z = -5000;
      timeline.to(this._wrap.position, 12.0, {
        z: 6000,
        ease: Quart.easeIn
      }, 0);
      // ------------------------
      // 3種類のカメラモーションのいずれかを適用する
      // ------------------------
      if (Math.random() < 0.3) {
        timeline.set(this.camera.position, {
          x: 200,
          y: -200,
          z: 1000
        }, 0);
        timeline.to(this.camera.position, 14.0, {
          x: 0,
          y: 0,
          z: 5000,
          ease: Quart.easeInOut
        }, 0);
        timeline.set(this.camera, {
          fov: 90
        }, 0);
        timeline.to(this.camera, 14.0, {
          fov: 45,
          ease: Quart.easeInOut
        }, 0);
      } else if (Math.random() < 0.5) {
        timeline.set(this.camera.position, {
          x: 100,
          y: +1000,
          z: 1000
        }, 0);
        timeline.to(this.camera.position, 14.0, {
          x: 0,
          y: 0,
          z: 5000,
          ease: Quart.easeInOut
        }, 0);
      } else {
        timeline.set(this.camera.position, {
          x: -3000,
          y: 3000,
          z: 0
        }, 0);
        timeline.to(this.camera.position, 15.0, {
          x: 0,
          y: 0,
          z: 5000,
          ease: Quart.easeInOut
        }, 0);
      }
      // 黒マットのフェードイン
      timeline.to("#coverBlack", 1.0, {
        css: {
          opacity: 0.0
        }
      }, 0.0);
      // ------------------------
      // 3種類のタイムリマップのいずれかを適用する
      // ------------------------
      if (Math.random() < 0.3) {
        timeline.timeScale(3.0);
        timeline.addCallback(function() {
          TweenMax.to(timeline, 1.0, {
            timeScale: 0.05,
            ease: Cubic.easeInOut
          });
          TweenMax.to(timeline, 0.5, {
            timeScale: 3.0,
            delay: 3.5,
            ease: Cubic.easeInOut
          });
          TweenMax.to(timeline, 0.5, {
            timeScale: 0.05,
            delay: 4.0,
            ease: Cubic.easeInOut
          });
          TweenMax.to(timeline, 2.0, {
            timeScale: 5.0,
            delay: 9.0,
            ease: Cubic.easeIn
          });
        }, 3.5);
      } else if (Math.random() < 0.5) {
        timeline.timeScale(6.0);
        TweenMax.to(timeline, 4.0, {
          timeScale: 0.005,
          ease: Cubic.easeOut
        });
        TweenMax.to(timeline, 4.0, {
          timeScale: 2.0,
          ease: Cubic.easeIn,
          delay: 5.0
        });
      } else {
        timeline.timeScale(1.0);
      }
      // 背景の色変更
      this._bg.material.color.setHSL(this._hue, 1.0, 0.5);
      // 色相を移動
      this._hue += 0.2;
      if (this._hue >= 1.0) {
        this._hue = 0.0;
      }
    };
    DemoIconsWorld.prototype.onTick = function() {
      _super.prototype.onTick.call(this);
      this.camera.lookAt(this.HELPER_ZERO);
      // 背景をカメラの反対側に配置
      var vec = this.camera.position.clone();
      vec.negate();
      vec.normalize();
      vec.multiplyScalar(10000);
      this._bg.position.copy(vec);
      this._bg.lookAt(this.camera.position);
    };
    /**
     * ジオメトリ内のUVを変更します。
     * @param geometry    {THREE.PlaneGeometry}
     * @param unitx    {number}
     * @param unity    {number}
     * @param offsetx    {number}
     * @param offsety    {number}
     */
    DemoIconsWorld.prototype.change_uvs = function(geometry, unitx, unity, offsetx, offsety) {
      var faceVertexUvs = geometry.faceVertexUvs[0];
      for (var i = 0; i < faceVertexUvs.length; i++) {
        var uvs = faceVertexUvs[i];
        for (var j = 0; j < uvs.length; j++) {
          var uv = uvs[j];
          uv.x = (uv.x + offsetx) * unitx;
          uv.y = (uv.y + offsety) * unity;
        }
      }
    };
    return DemoIconsWorld;
  })(demo.BasicView);
})(demo || (demo = {}));

window.addEventListener("load", function() {
  new demo.DemoIconsPreload();
});