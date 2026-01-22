import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { RxState } from '@rx-angular/state';
import { RxActionFactory, rxActions } from '@rx-angular/state/actions';
import { merge } from 'rxjs';
import { ListDetailAdapter } from '../list-detail-page.adapter';

type Actions = {
  openDialog: void;
  closeDialog: void;
  confirm: void;
};
@Component({
  standalone: true,
  selector: 'app-list-remove',
  templateUrl: './list-remove.component.html',
  styleUrls: ['./list-remove.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RxActionFactory],
})
export default class ListRemoveComponent
  extends RxState<never>
  implements AfterViewInit
{
  public adapter = inject(ListDetailAdapter);

  @ViewChild('dialog', { static: true }) dialog!: ElementRef<{
    showModal: () => void;
    close: () => void;
  }>;

  readonly ui = rxActions<Actions>();

  constructor() {
    super();
    this.hold(this.ui.confirm$, this.adapter.ui.deleteList);
  }

  ngAfterViewInit(): void {
    this.hold(merge(this.ui.confirm$, this.ui.closeDialog$), () =>
      this.dialog.nativeElement.close()
    );
    this.hold(this.ui.openDialog$, () => this.dialog.nativeElement.showModal());
  }
}
