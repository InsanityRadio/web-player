export module HTTP {

	export abstract class Request {

		public xml:XMLHttpRequest;
		public status:number;
		public responseText:string;
		protected METHOD:string;

		constructor(protected url:string, protected success:(scope:Request) => void, protected error?:(scope:Request) => void) {

			this.xml = new XMLHttpRequest();
			this.xml.withCredentials = true; 
			this.xml.onreadystatechange = () => this.stateChange();

		}

		private stateChange():void {

			if(this.xml.readyState != 4) return;

			this.status = this.xml.status;
			this.responseText = this.xml.responseText;

			this.xml.status == 200 ? this.success(this) : this.error(this);

		}

		open(): void {  }

		send(form?:Object, contentType?:string):void {

			this.xml.open(this.METHOD, this.url, true);
			// This provides space for, say, additional headers
			this.open();
			this.xml.send();

		}

	}

	export class GET extends Request {

		protected METHOD:string = "GET";

		constructor(protected url:string, protected success:(scope:Request) => void, protected error?:(scope:Request) => void) {

			super(url, success, error);
			this.send();

		}

	}

	export class POST extends Request {

		protected METHOD:string = "POST";

		send(form:Object, contentType:string = "application/json"):void {

			var data:string|Object;

			// Depending on the contentType, we should probably properly encode the data.
			switch(contentType) {

				case "application/json":
					data = JSON.stringify(form);
					break;

				case "application/x-www-form-urlencoded":
					contentType += "; charset=UTF-8";
					data = Utilities.Form.encode(form);
					break;

				case "formData":
					contentType = null;
					data = form;
					break;

				default:
					throw new Error("Expected valid content type, instead got " + contentType);

			}

			this.xml.open(this.METHOD, this.url, true);
			if(contentType)
				this.xml.setRequestHeader("Content-Type", contentType);
			this.open();

			this.xml.send(data);

		}

	}

	export class Upload {

		protected isReady:boolean = false;
		protected file:File;
		protected form:FormData;
		protected path:string;
		protected token:string;

		constructor(protected base, protected uploadDone:(scope:Request) => void,
				protected uploadProgress:(percent:number, message:string) => void, protected uploadError:(error:Error) => void) {

			var xml = new GET(base + "path/", (scope:Request) => this.ready(scope), (e) => this.error(e));


		}

		send(form:FormData, file:File):void {

			this.form = form;
			this.file = file;
			if(!this.isReady) return;

			var xml = new POST(this.path + "do/", (scope:Request) => this.done(scope), (e) => this.error(e));
			xml.xml.upload.onprogress = (e:ProgressEvent) => this.uploadProgress(e.loaded / e.total * 100, null);

			if(form == null)
				form = new FormData();

			form.append("file", file);
			xml.send(form, "formData");

		}

		protected ready(scope:Request) {

			// We now have the upload location and can be ready
			this.isReady = true;
			this.path = JSON.parse(scope.xml.responseText).path;

			// send() has already been called, but it was too early. Run it again.
			if(this.file) this.send(this.form, this.file);

		}

		protected done(scope:Request) {

			var token = JSON.parse(scope.xml.responseText).token;
			this.token = token;

			this.getStatus();

		}

		protected getStatus() {

			var xml = new GET(this.path + "status/" + this.token, (scope:Request) => {

				var data = JSON.parse(scope.xml.responseText);
				this.uploadProgress(100 + data.percent, data.message);

				if(data.running)
					setTimeout(() => this.getStatus(), 1000);
				else
					this.uploadDone(data);

			}, (e) => this.error(e));

		}

		protected error(e) {

			this.uploadError(e);

		}

	}

}

export module Utilities {

	export class Form {

		static encode(form:Object) {
			var str:string[] = [];
			for(var i in form)
				str.push(encodeURIComponent(i) + "=" + encodeURIComponent(form[i]));
			return str.join("&");
		}

	}

	export class String {

		static stripTag(tag:string){
			return tag.replace(/ *[\(\[][^)]*[\)\]] */g, "");
		}

	}
}