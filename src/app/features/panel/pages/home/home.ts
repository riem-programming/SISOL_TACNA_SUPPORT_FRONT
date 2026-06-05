import { Component, inject } from '@angular/core';
import { Card } from '../../components/card/card';
import { CardInput } from '../../components/card/model/card.model';
import { Router } from '@angular/router';
import { CurrentUserService } from '../../../../core/services/current-user-service';

@Component({
  selector: 'app-home',
  imports: [Card],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export default class Home {
  private currentUserService = inject(CurrentUserService);
  currentUser = this.currentUserService.user;

  valueCreateCard: CardInput = {
    title: 'Crear Solicitud',
    subtitle: 'Reporta un problema o pide soporte',
    description:
      'Abre una nueva solicitud para reportar problemas de usuario, firma, sistema u otros.',
    nameButton: 'Crear Nueva Solicitud',
    nameIcon: 'add_circle',
    primary: true,
  };

  valueMyRequestCard: CardInput = {
    title: 'Mis Solicitudes',
    subtitle: 'Revisa el estado de tus tickets',
    description: 'Consulta el estado, prioridad y detalles de tus solicitudes de soporte.',
    nameButton: 'Ver mis solicitudes',
    nameIcon: 'list_alt',
    primary: false,
  };

  private router = inject(Router);

  navegateToCreateRequest() {
    this.router.navigate(['panel', 'crear-solicitud']);
  }

  navegateToMyRequest() {
    this.router.navigate(['panel', 'mis-solicitudes']);
  }
}
