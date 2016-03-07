/******/ (function(modules) { // webpackBootstrap
	/******/ 	// The module cache
	/******/ 	var installedModules = {};

	/******/ 	// The require function
	/******/ 	function __webpack_require__(moduleId) {

		/******/ 		// Check if module is in cache
		/******/ 		if(installedModules[moduleId])
		/******/ 			return installedModules[moduleId].exports;

		/******/ 		// Create a new module (and put it into the cache)
		/******/ 		var module = installedModules[moduleId] = {
			/******/ 			exports: {},
			/******/ 			id: moduleId,
			/******/ 			loaded: false
			/******/ 		};

		/******/ 		// Execute the module function
		/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

		/******/ 		// Flag the module as loaded
		/******/ 		module.loaded = true;

		/******/ 		// Return the exports of the module
		/******/ 		return module.exports;
		/******/ 	}


	/******/ 	// expose the modules object (__webpack_modules__)
	/******/ 	__webpack_require__.m = modules;

	/******/ 	// expose the module cache
	/******/ 	__webpack_require__.c = installedModules;

	/******/ 	// __webpack_public_path__
	/******/ 	__webpack_require__.p = "";

	/******/ 	// Load entry module and return exports
	/******/ 	return __webpack_require__(0);
	/******/ })
/************************************************************************/
/******/ ([
	/* 0 */
	/***/ function(module, exports, __webpack_require__) {

		"use strict";

		var EventEmitter = __webpack_require__(1).EventEmitter;
		var ByteBuffer = __webpack_require__(2);

		var OSD = __webpack_require__(6);
		var RC = __webpack_require__(8);
		var RCGPS = __webpack_require__(9);
		var Deform = __webpack_require__(10);
		var Gimbal = __webpack_require__(11);
		var AppMessage = __webpack_require__(12);
		var SmartBattery = __webpack_require__(13);
		var CenterBattery = __webpack_require__(14);
		var Custom = __webpack_require__(15);
		var Home = __webpack_require__(16);

		var types = {
			1: "OSD",
			2: "HOME",
			3: "GIMBAL",
			4: "RC",
			5: "CUSTOM",
			6: "DEFORM",
			7: "CENTER_BATTERY",
			8: "SMART_BATTERY",
			9: "APP_TIP",
			10: "APP_WARN",
			11: "RC_GPS",
			12: "RC_DEBUG",
			13: "RECOVER",
			14: "APP_GPS",
			15: "FIRMWARE",
			255: "END",
			254: "OTHER"
		};

		function DJIParser() {
			this.lastMessages = {};
		}

		DJIParser.prototype = Object.create(EventEmitter.prototype);

		DJIParser.prototype.getLast = function(type) {
			return this.lastMessages[type];
		}

		DJIParser.prototype.parse = function(buffer) {

			buffer = ByteBuffer.wrap(buffer, "binary", true);

			var dataLen = buffer.readUint32(0);

			// these are related to bitmaps, which are stored at the end of the file
			//buffer.readInt16LE(8);
			//buffer.readInt16LE(10);

			// packets start at offset 12
			var offset = 12;

			while (offset < dataLen) {

				// first byte of a packet is 'type'
				var tId = buffer.readUint8(offset++);
				var type = types[tId];

				// second byte is packet length
				var length = buffer.readUint8(offset++);

				var end = buffer.readUint8(offset + length);

				if (end != 0xFF) {
					break;
				}

				var data = null;

				switch (type) {
					case "OSD":
						data = new OSD(buffer, offset);
						break;
					case "DEFORM":
						data = new Deform(buffer, offset);
						break;
					case "SMART_BATTERY":
						data = new SmartBattery(buffer, offset);
						break;
					case "GIMBAL":
						data = new Gimbal(buffer, offset);
						break;
					case "RC":
						data = new RC(buffer, offset);
						break;
					case "CUSTOM":
						data = new Custom(buffer, offset);
						break;
					case "RC_GPS":
						data = new RCGPS(buffer, offset);
						break;
					case "CENTER_BATTERY":
						data = new CenterBattery(buffer, offset);
						break;
					case "HOME":
						data = new Home(buffer, offset);
						break;
					case "APP_TIP":
					case "APP_WARN":
						data = new AppMessage(buffer, offset, length);
						break;
				}

				if (data !== null) {
					this.emit(type, data);
					this.lastMessages[type] = data;
				}

				offset += length + 1;
			}
			console.log("Done");
		}

		if (typeof window != "undefined") {
			window.DJIParser = DJIParser;
		}

		module.exports = DJIParser;

		/***/ },
	,
	/* 3 */
	/***/ function(module, exports) {

		module.exports = function(module) {
			if(!module.webpackPolyfill) {
				module.deprecate = function() {};
				module.paths = [];
				// module.parent = undefined by default
				module.children = [];
				module.webpackPolyfill = 1;
			}
			return module;
		}


		/***/ },
	/* 4 */
	/***/ function(module, exports) {

		module.exports = function() { throw new Error("define cannot be used indirect"); };


		/***/ },
	/* 5 */
	/***/ ,
	/* 6 */
	/***/ function(module, exports, __webpack_require__) {

		"use strict";

		var DJIBuffer = __webpack_require__(7);

		var DRONE_TYPE = {
			0: "Unknown",
			1: "Inspire",
			2: "P3S",
			3: "P3X",
			4: "P3C",
			5: "OpenFrame",
			100: "None"
		};

		var FLYC_STATE = {
			0: "MANUAL",
			1: "ATTI",
			2: "ATTI_CL",
			3: "ATTI_HOVER",
			4: "HOVER",
			5: "GSP_BLAKE",
			6: "GPS_ATTI",
			7: "GPS_CL",
			8: "GPS_HOME_LOCK",
			9: "GPS_HOT_POINT",
			10: "ASSISTED_TAKEOFF",
			11: "AUTO_TAKEOFF",
			12: "AUTO_LANDING",
			13: "ATTI_LANDING",
			14: "NAVI_GO",
			15: "GO_HOME",
			16: "CLICK_GO",
			17: "JOYSTICK",
			23: "ATTI_LIMITED",
			24: "GPS_ATTI_LIMITED",
			100: "OTHER"
		};

		var GOHOME_STATUS = {
			0: "STANDBY",
			1: "PREASCENDING",
			2: "ALIGN",
			3: "ASCENDING",
			4: "CRUISE",
			7: "OTHER"
		};

		var BATTERY_TYPE = {
			0: "UNKNOWN",
			1: "NONSMART",
			2: "SMART"
		};

		var MOTOR_START_FAILED_CAUSE = {
			0: "None",
			1: "CompassError",
			2: "AssistantProtected",
			3: "DeviceLocked",
			4: "DistanceLimit",
			5: "IMUNeedCalibration",
			6: "IMUSNError",
			7: "IMUWarning",
			8: "CompassCalibrating",
			9: "AttiError",
			10: "NoviceProtected",
			11: "BatteryCellError",
			12: "BatteryCommuniteError",
			13: "SeriouLowVoltage",
			14: "SeriouLowPower",
			15: "LowVoltage",
			16: "TempureVolLow",
			17: "SmartLowToLand",
			18: "BatteryNotReady",
			19: "SimulatorMode",
			20: "PackMode",
			21: "AttitudeAbNormal",
			22: "UnActive",
			23: "FlyForbiddenError",
			24: "BiasError",
			25: "EscError",
			26: "ImuInitError",
			27: "SystemUpgrade",
			28: "SimulatorStarted",
			29: "ImuingError",
			30: "AttiAngleOver",
			31: "GyroscopeError",
			32: "AcceletorError",
			33: "CompassFailed",
			34: "BarometerError",
			35: "BarometerNegative",
			36: "CompassBig",
			37: "GyroscopeBiasBig",
			38: "AcceletorBiasBig",
			39: "CompassNoiseBig",
			40: "BarometerNoiseBig",
			256: "OTHER"
		};

		var NON_GPS_CAUSE  = {
			0: "ALREADY",
			1: "FORBIN",
			2: "GPSNUM_NONENOUGH",
			3: "GPS_HDOP_LARGE",
			4: "GPS_POSITION_NONMATCH",
			5: "SPEED_ERROR_LARGE",
			6: "YAW_ERROR_LARGE",
			7: "COMPASS_ERROR_LARGE",
			8: "UNKNOWN"
		};

		var IMU_INITFAIL_REASON = {
			0: "MONITOR_ERROR",
			1: "COLLECTING_DATA",
			2: "GYRO_DEAD",
			3: "ACCE_DEAD",
			4: "COMPASS_DEAD",
			5: "BAROMETER_DEAD",
			6: "BAROMETER_NEGATIVE",
			7: "COMPASS_MOD_TOO_LARGE",
			8: "GYRO_BIAS_TOO_LARGE",
			9: "ACCE_BIAS_TOO_LARGE",
			10: "COMPASS_NOISE_TOO_LARGE",
			11: "BAROMETER_NOISE_TOO_LARGE",
			12: "WAITING_MC_STATIONARY",
			13: "ACCE_MOVE_TOO_LARGE",
			14: "MC_HEADER_MOVED",
			15: "MC_VIBRATED",
			16: "NONE"
		};

		function OSD(buffer, index) {
			this.buffer = buffer;
			this.index = index;
		}

		OSD.prototype = Object.create(DJIBuffer.prototype);

		OSD.prototype.getLongitude = function() {
			return (this.readDouble(0, 8) * 180) / Math.PI;
		}

		OSD.prototype.getLatitude = function() {
			return (this.readDouble(8, 8) * 180) / Math.PI;
		}

		OSD.prototype.getHeight = function() {
			return this.readShort(16, 2) / 10;
		}

		OSD.prototype.getXSpeed = function() {
			return this.readShort(18, 2);
		}

		OSD.prototype.getYSpeed = function() {
			return this.readShort(20, 2);
		}

		OSD.prototype.getZSpeed = function() {
			return this.readShort(22, 2);
		}

		OSD.prototype.getPitch = function() {
			return this.readShort(24, 2);
		}

		OSD.prototype.getRoll = function() {
			return this.readShort(26, 2);
		}

		OSD.prototype.getYaw = function() {
			return this.readShort(28, 2);
		}

		OSD.prototype.getRcState = function() {
			return (this.readShort(30, 1) & 128) == 0;
		}

		OSD.prototype.getFlycState = function() {
			return FLYC_STATE[this.readShort(30, 1) & -129];
		}

		OSD.prototype.getAppCommend = function() {
			return this.readShort(31, 1);
		}

		OSD.prototype.canIOCWork = function() {
			return (this.readInt(32, 4) & 1) == 1;
		}

		OSD.prototype.groundOrSky = function() {
			return this.readInt(32, 4) >> 1 & 3;
		}

		OSD.prototype.isMotorUp = function() {
			return (this.readInt(32, 4) >> 3 & 1) == 1
		}

		OSD.prototype.isSwaveWork = function() {
			return (this.readInt(32, 4) & 16) != 0;
		}

		OSD.prototype.getGohomeStatus = function() {
			return GOHOME_STATUS[this.readInt(32, 4) >> 5 & 7];
		}

		OSD.prototype.isImuPreheated = function() {
			return (this.readInt(32, 4) & 4096) != 0;
		}

		OSD.prototype.isVisionUsed = function() {
			return (this.readInt(32, 4) & 256) != 0;
		}

		OSD.prototype.getVoltageWarning = function() {
			return (this.readInt(32, 4) & 1536) >>> 9;
		}

		OSD.prototype.getModeChannel = function() {
			return (this.readInt(32, 4) & 24576) >>> 13;
		}

		OSD.prototype.getCompassError = function() {
			return (this.readInt(32, 4) & 65536) != 0;
		}

		OSD.prototype.getWaveError = function() {
			return (this.readInt(32, 4) & 131072) != 0;
		}

		OSD.prototype.getGpsLevel = function() {
			return this.readInt(32, 4) >>> 18 & 15;
		}

		OSD.prototype.getBatteryType = function() {
			if (this.getDroneType() == "P3C") {
				return BATTERY_TYPE[this.readInt(32, 4) >>> 22 & 3]
			}
			return "SMART";
		}

		OSD.prototype.isAcceletorOverRange = function() {
			return (this.readInt(32, 4) >>> 24 & 1) != 0;
		}

		OSD.prototype.isVibrating = function() {
			return (this.readInt(32, 4) >>> 25 & 1) != 0;
		}

		OSD.prototype.isBarometerDeadInAir = function() {
			return (this.readInt(32, 4) >>> 26 & 1) != 0;
		}

		OSD.prototype.isNotEnoughForce = function() {
			return (this.readInt(32, 4) >>> 28 & 1) != 0;
		}

		OSD.prototype.getGpsNum = function() {
			return this.readShort(36, 1);
		}

		OSD.prototype.getFlightAction = function() {
			return this.readShort(37, 1);
		}

		OSD.prototype.getMotorFailedCause = function() {
			var s2 = this.readShort(38, 1);
			if (s2 >> 7 == 0) {
				return "NONE";
			}
			return MOTOR_START_FAILED_CAUSE[this.readShort(38, 1) & 127];
		}

		OSD.prototype.getNonGpsCause = function() {
			return NON_GPS_CAUSE[this.readInt(39, 1) & 15];
		}

		OSD.prototype.getBattery = function() {
			return this.readInt(40, 1);
		}

		OSD.prototype.getSwaveHeight = function() {
			return this.readShort(41, 1);
		}

		OSD.prototype.getFlyTime = function() {
			return this.readInt(42, 2) / 10;
		}

		OSD.prototype.getMotorRevolution = function() {
			return this.readShort(44, 1);
		}

		OSD.prototype.getFlycVersion = function() {
			return this.readInt(47, 1);
		}

		OSD.prototype.getDroneType = function() {
			return DRONE_TYPE[this.readInt(48, 1)];
		}

		OSD.prototype.getIMUinitFailReason = function() {
			return IMU_INITFAIL_REASON[this.readInt(49, 1)];
		}

		OSD.prototype.isImuInitError = function() {
			var reason = this.getIMUinitFailReason();
			return reason != "None" && reason != "ColletingData" && reason != "MonitorError";
		}

		module.exports = OSD;

		/***/ },
	/* 7 */
	/***/ function(module, exports, __webpack_require__) {

		"use strict";

		var ByteBuffer = __webpack_require__(2);
		var tmpBuffer = new ByteBuffer(32, true);

		function DJIBuffer(buffer, index) {
			this.buffer = buffer;
			this.index = 0;
		}

		DJIBuffer.prototype.clearAndCopy = function(offset, length) {
			tmpBuffer.fill(0, 0, tmpBuffer.length);
			this.buffer.copyTo(tmpBuffer, 0, this.index + offset, this.index + offset + length);
			return tmpBuffer;
		}

		DJIBuffer.prototype.readDouble = function(offset, length) {
			return this.clearAndCopy(offset, length).readDouble(0);
		}

		DJIBuffer.prototype.readFloat = function(offset, length) {
			return this.clearAndCopy(offset, length).readFloat(0);
		}

		DJIBuffer.prototype.readByte = function(offset) {
			return this.readUint8(this.index + offset);
		}

		DJIBuffer.prototype.readInt = function(offset, length) {
			return this.clearAndCopy(offset, length).readInt32(0);
		}

		DJIBuffer.prototype.readShort = function(offset, length) {
			return this.clearAndCopy(offset, length).readInt16(0);
		}

		DJIBuffer.prototype.length = function() {
			return this.buffer.length;
		}

		module.exports = DJIBuffer;

		/***/ },
	/* 8 */
	/***/ function(module, exports, __webpack_require__) {

		"use strict";

		var DJIBuffer = __webpack_require__(7);

		function RC(buffer, index) {
			this.buffer = buffer;
			this.index = index;
		}

		RC.prototype = Object.create(DJIBuffer.prototype);

		RC.prototype.getAileron = function() {
			return this.readInt(0, 2);
		}

		RC.prototype.getElevator = function() {
			return this.readInt(2, 2);
		}

		RC.prototype.getThrottle = function() {
			return this.readInt(4, 2);
		}

		RC.prototype.getRudder = function() {
			return this.readInt(6, 2);
		}

		RC.prototype.getGyroValue = function() {
			return this.readInt(8, 2);
		}

		RC.prototype.getFootStool = function() {
			return (this.readInt(11, 1) >> 6 & 4) == 3;
		}

		RC.prototype.getMode = function() {
			return this.readInt(11, 1) >> 4 & 3;
		}

		RC.prototype.getGoHome = function() {
			return this.readInt(11, 1) >> 3 & 1;
		}

		RC.prototype.getCoronaChange = function() {
			return (this.readInt(10, 1) >> 7 & 1) == 1;
		}

		RC.prototype.getChangeDirection = function() {
			return this.readInt(10, 1) >> 6 & 1;
		}

		RC.prototype.getOffset = function() {
			return this.readInt(10, 1) >> 1 & 31;
		}

		RC.prototype.getIsPushCorona = function() {
			return this.readInt(10, 1) & 1;
		}

		RC.prototype.getRecordStatus = function() {
			return (this.readInt(12, 1) >> 7 & 1) == 1;
		}

		RC.prototype.getShutterStatus = function() {
			return (this.readInt(12, 1) >> 6 & 1) == 1;
		}

		RC.prototype.getPlayback = function() {
			return this.readInt(12, 1) >> 5 & 1;
		}

		RC.prototype.getCustom2 = function() {
			return this.readInt(12, 1) >> 3 & 1;
		}

		RC.prototype.getCustom1 = function() {
			return this.readInt(12, 1) >> 4 & 1;
		}

		module.exports = RC;

		/***/ },
	/* 9 */
	/***/ function(module, exports, __webpack_require__) {

		"use strict";

		var DJIBuffer = __webpack_require__(7);

		function RCGPS(buffer, index) {
			this.buffer = buffer;
			this.index = index;
		}

		RCGPS.prototype = Object.create(DJIBuffer.prototype);

		RCGPS.prototype.getLatitude = function() {
			return this.readInt(7, 4);
		}

		RCGPS.prototype.getLongitude = function() {
			return this.readInt(11, 4);
		}

		RCGPS.prototype.getXSpeed = function() {
			return this.readInt(15, 4) / 1000;
		}

		RCGPS.prototype.getYSpeed = function() {
			return this.readInt(19, 4) / 1000;
		}

		RCGPS.prototype.getGpsNum = function() {
			return this.readShort(23, 1);
		}

		RCGPS.prototype.getGpsStatus = function() {
			return this.readShort(28, 2) == 1;
		}

		module.exports = RCGPS;

		/***/ },
	/* 10 */
	/***/ function(module, exports, __webpack_require__) {

		"use strict";

		var DJIBuffer = __webpack_require__(7);

		var DEFORM_MODE = {
			0: "PACK",
			1: "PROTECT",
			2: "NORMAL",
			3: "OTHER"
		};

		var TRIPOD_STATUS = {
			0: "UNKNOWN",
			1: "FOLD_COMPLETE",
			2: "FOLDING",
			3: "STRETCH_COMPLETE",
			4: "STRETCHING",
			5: "STOP_DEFORMATION"
		};

		function Deform(buffer, index) {
			this.buffer = buffer;
			this.index = index;
		}

		Deform.prototype = Object.create(DJIBuffer.prototype);

		Deform.prototype.getDeformMode = function() {
			return DEFORM_MODE[(this.readInt(0, 1) & 48) >>> 4]
		}

		Deform.prototype.getDeformStatus = function() {
			return TRIPOD_STATUS[(this.readInt(0, 1) & 14) >>> 1];
		}

		Deform.prototype.isDeformProtected = function() {
			return (this.readInt(0, 1) & 1) != 0;
		}


		module.exports = Deform;

		/***/ },
	/* 11 */
	/***/ function(module, exports, __webpack_require__) {

		"use strict";

		var DJIBuffer = __webpack_require__(7);

		var MODE = {
			0: "YawNoFollow",
			1: "FPV",
			2: "YawFollow",
			100: "OTHER"
		};

		function Gimbal(buffer, index) {
			this.buffer = buffer;
			this.index = index;
		}

		Gimbal.prototype = Object.create(DJIBuffer.prototype);

		Gimbal.prototype.getPitch = function() {
			return this.readShort(0, 2);
		}

		Gimbal.prototype.getRoll = function() {
			return this.readShort(2, 2);
		}

		Gimbal.prototype.getYaw = function() {
			return this.readShort(4, 2);
		}

		Gimbal.prototype.getRollAdjust = function() {
			return this.readShort(7, 1);
		}

		Gimbal.prototype.getCalibrationStatus = function() {
			return this.readByte(10);
		}

		Gimbal.prototype.getYawAngle = function() {
			return this.readShort(8, 2);
		}

		Gimbal.prototype.getMode = function() {
			return MODE[this.readInt(6, 1) >>> 6];
		}

		module.exports = Gimbal;

		/***/ },
	/* 12 */
	/***/ function(module, exports, __webpack_require__) {

		"use strict";

		var DJIBuffer = __webpack_require__(7);

		function AppMessage(buffer, index, length) {
			this.buffer = buffer;
			this.index = index;
			this.length = length;
		}

		AppMessage.prototype = Object.create(DJIBuffer.prototype);

		AppMessage.prototype.getMessage = function() {
			return this.buffer.toString("utf8", this.index, this.index + this.length);
		}

		module.exports = AppMessage;

		/***/ },
	/* 13 */
	/***/ function(module, exports, __webpack_require__) {

		"use strict";

		var DJIBuffer = __webpack_require__(7);

		var DJI_BATTERY_STATUS = {
			0: "UserBatteryReqGoHome",
			1: "UserBatteryReqLand",
			4: "SmartBatteryReqGoHome",
			8: "SmartBatteryReqLand",
			16: "MainVoltageLowGoHOme",
			32: "MainVoltageLowLand",
			64: "BatteryCellError",
			128: "BatteryCommunicateError",
			256: "VoltageLowNeedLand",
			512: "BatteryTempVoltageLow",
			1024: "BatteryNotReady",
			2048: "BatteryFirstChargeNotFull",
			69905: "OTHER"
		};

		function SmartBattery(buffer, index) {
			this.buffer = buffer;
			this.index = index;
		}

		SmartBattery.prototype = Object.create(DJIBuffer.prototype);

		SmartBattery.prototype.getUsefulTime = function() {
			return this.readInt(0, 2);
		}

		SmartBattery.prototype.getGoHomeTime = function() {
			return this.readInt(2, 2);
		}

		SmartBattery.prototype.getLandTime = function() {
			return this.readInt(4, 2);
		}

		SmartBattery.prototype.getGoHomeBattery = function() {
			return this.readInt(6, 2);
		}

		SmartBattery.prototype.getLandBattery = function() {
			return this.readInt(8, 2);
		}

		SmartBattery.prototype.getSafeFlyRadius = function() {
			return this.readFloat(10, 4);
		}

		SmartBattery.prototype.getVolumeConsume = function() {
			return this.readFloat(14, 4);
		}

		SmartBattery.prototype.getStatus = function() {
			return DJI_BATTERY_STATUS[this.readInt(18, 4)];
		}

		SmartBattery.prototype.getGoHomeStatus = function() {
			return this.readInt(22, 1);
		}

		SmartBattery.prototype.getGoHomeCountDown = function() {
			return this.readInt(23, 1);
		}

		SmartBattery.prototype.getVoltage = function() {
			return this.readInt(24, 2);
		}

		//SmartBattery.prototype.getBattery

		SmartBattery.prototype.getLowWarning = function() {
			return this.readInt(27, 1) & 127;
		}

		SmartBattery.prototype.getLowWarningGoHome = function() {
			return (this.readInt(27, 1) & 128) != 0;
		}

		SmartBattery.prototype.getSeriousLowWarning = function() {
			return this.readInt(28, 1) & 127;
		}

		SmartBattery.prototype.getSeriousLowWarningLanding = function() {
			return (this.readInt(28, 1) & 128) != 0;
		}

		SmartBattery.prototype.getVoltagePercent = function() {
			return this.readInt(29, 1);
		}

		module.exports = SmartBattery;

		/***/ },
	/* 14 */
	/***/ function(module, exports, __webpack_require__) {

		"use strict";

		var DJIBuffer = __webpack_require__(7);

		var CONN_STATUS = {
			0: "NORMAL",
			1: "INVALID",
			2: "EXCEPTION",
			100: "OTHER"
		};

		function CenterBattery(buffer, index) {
			this.buffer = buffer;
			this.index = index;
		}

		CenterBattery.prototype = Object.create(DJIBuffer.prototype);

		CenterBattery.prototype.getRelativeCapacity = function() {
			return this.readInt(0, 1);
		}

		CenterBattery.prototype.getCurrentPV = function() {
			return this.readInt(1, 2);
		}

		CenterBattery.prototype.getCurrentCapacity = function() {
			return this.readInt(3, 2);
		}

		CenterBattery.prototype.getFullCapacity = function() {
			return this.readInt(5, 2);
		}

		CenterBattery.prototype.getLife = function() {
			return this.readInt(7, 1);
		}

		CenterBattery.prototype.getLoopNum = function() {
			return this.readInt(8, 2);
		}

		CenterBattery.prototype.getErrorType = function() {
			return this.readInt(10, 4);
		}

		CenterBattery.prototype.getCurrent = function() {
			return this.readInt(14, 2);
		}

		CenterBattery.prototype.getPartVoltages = function() {
			var voltages = [];
			for (var i = 0; i < 6; i++) {
				voltages[i] = this.readInt(16 + (i * 2), 2);
			}
			return voltages;
		}

		CenterBattery.prototype.getSerialNo = function() {
			return this.readInt(28, 2);
		}

		CenterBattery.prototype.getProductDate = function() {
			var n2 = this.readInt(30, 2);
			return [
				((n2 & 65024) >>> 9) + 1980,
				(n2 & 480) >>> 5,
				n2 & 31
			];
		}

		CenterBattery.prototype.getTemperature = function() {
			return this.readInt(32, 2);
		}

		CenterBattery.prototype.getConnStatus = function() {
			return CONN_STATUS[this.readInt(34, 1)];
		}

		CenterBattery.prototype.totalStudyCycle = function() {
			return this.readInt(35, 2);
		}

		CenterBattery.prototype.lastStudyCycle = function() {
			return this.readInt(37, 2);
		}

		module.exports = CenterBattery;

		/***/ },
	/* 15 */
	/***/ function(module, exports, __webpack_require__) {

		"use strict";

		var DJIBuffer = __webpack_require__(7);

		function Custom(buffer, index) {
			this.buffer = buffer;
			this.index = index;
		}

		Custom.prototype = Object.create(DJIBuffer.prototype);

		Custom.prototype.getData = function() {
			return [
				this.readByte(0),
				this.readByte(1),
				this.readFloat(2, 4),
				this.readFloat(6, 4),
				// long(10, 8)
			];
		}

		module.exports = Custom;

		/***/ },
	/* 16 */
	/***/ function(module, exports, __webpack_require__) {

		"use strict";

		var DJIBuffer = __webpack_require__(7);

		function Home(buffer, index) {
			this.buffer = buffer;
			this.index = index;
		}

		Home.prototype = Object.create(DJIBuffer.prototype);

		Home.prototype.getLongitude = function() {
			return this.readDouble(0, 8) * 180 / Math.PI;
		}

		Home.prototype.getLatitude = function() {
			return this.readDouble(8, 8) * 180 / Math.PI;
		}

		Home.prototype.getHeight = function() {
			return this.readFloat(16, 4);
		}

		Home.prototype.getIOCMode = function() {
			return (this.readInt(20, 2) & 57344) >>> 13;
		}

		Home.prototype.isIOCEnabled = function() {
			return ((this.readInt(20, 2) & 4096) >>> 12) != 0;
		}

		Home.prototype.isBeginnerMode = function() {
			return (this.readInt(20, 2) >> 11 & 1) != 0;
		}

		Home.prototype.isCompassCeleing = function() {
			return ((this.readInt(20, 2) & 1024) >>> 10) != 0;
		}

		Home.prototype.getCompassCeleStatus = function() {
			return (this.readInt(20, 2) & 768) >>> 8;
		}

		Home.prototype.hasGoHome = function() {
			return ((this.readInt(20, 2) & 128) >>> 7) != 0;
		}

		Home.prototype.getGoHomeStatus = function() {
			return (this.readInt(20, 2) & 112) >>> 4;
		}

		//Home.prototype.isMultipleModeOpen = function() {

		Home.prototype.isReachLimitHeight = function() {
			return ((this.readInt(20, 2) & 32) >>> 5) != 0;
		}

		Home.prototype.isReachLimitDistance = function() {
			return ((this.readInt(20, 2) & 16) >>> 4) != 0;
		}

		Home.prototype.isDynamicHomePointEnabled = function() {
			return ((this.readInt(20, 2)  & 8) >>> 3) != 0;
		}

		Home.prototype.getAircraftHeadDirection = function() {
			return (this.readInt(20, 2) & 4) >>> 2;
		}

		Home.prototype.getGoHomeMode = function() {
			return (this.readInt(20, 2) & 2) >>> 1;
		}

		Home.prototype.isHomeRecord = function() {
			return (this.readInt(20, 2) & 1) != 0;
		}

		Home.prototype.getGoHomeHeight = function() {
			return this.readInt(22, 2);
		}

		Home.prototype.getDataRecorderStatus = function() {
			return this.readInt(26, 1);
		}

		Home.prototype.getDataRecorderPercent = function() {
			return this.readInt(27, 1);
		}

		Home.prototype.getDataRecorderLeftTime = function() {
			return this.readInt(28, 2);
		}

		Home.prototype.getDataRecorderCurrentIndex = function() {
			return this.readInt(30, 2);
		}

		Home.prototype.getSimulatorOpen = function() {
			return (this.readInt(32, 1) & 1) != 0;
		}

		Home.prototype.getNavigationOpen = function() {
			return ((this.readInt(32, 1) & 2) >>> 1) != 0;
		}

		module.exports = Home;

		/***/ }
	/******/ ]);