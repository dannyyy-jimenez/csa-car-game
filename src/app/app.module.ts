import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { GameComponent } from './game/game.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';

var firebaseConfig = {
  apiKey: 'AIzaSyCWlHcHhz8utj1zNXFFqz_9SmXOwzzQRV0',
  projectId: 'car-game-a2374',
};

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    GameComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule,
    FormsModule
  ],
  providers: [
    AngularFirestore
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
