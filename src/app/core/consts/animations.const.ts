import { trigger, transition, style, animate, group } from "@angular/animations";

export const Animations = {
  opacify: trigger('opacify', [
		transition(':enter', [
			style({ opacity: 0 }),
			animate('300ms cubic-bezier(0.65, 0, 0.35, 1)', style({ opacity: 1 }))
		]),
    transition(':leave', [
			style({ opacity: 1 }),
			animate('300ms cubic-bezier(0.65, 0, 0.35, 1)', style({ opacity: 0 }))
		])
	]),
	fadeIn: trigger('fadeIn', [
		transition(':enter', [
			style({ opacity: 0, transform: 'translateY(50%)' }),
			group([
				animate('500ms cubic-bezier(0.65, 0, 0.35, 1)', style({ opacity: 1 })),
				animate('300ms cubic-bezier(0.65, 0, 0.35, 1)', style({ transform: 'translateY(0)' }))
			])
		]),
    transition(':leave', [
			style({ opacity: 1, transform: 'translateY(0)' }),
			group([
				animate('500ms cubic-bezier(0.65, 0, 0.35, 1)', style({ opacity: 0 })),
				animate('300ms cubic-bezier(0.65, 0, 0.35, 1)', style({ transform: 'translateY(50%)' }))
			])
		])
	]),
}
