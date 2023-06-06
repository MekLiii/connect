import { customElement, property } from 'lit/decorators.js'
import { TailwindElement } from '../../shared/tailwind.element'
import { html } from 'lit/static-html.js'
import style from './nightly-wallet-selector-item.css?inline'

@customElement('nightly-wallet-selector-item')
export class NightlyWalletSelectorItem extends TailwindElement(style) {
  @property({ type: String })
  name = ''

  @property({ type: String })
  icon = ''

  @property({ type: String })
  status = ''

  @property({ type: Function })
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onClick: (event: Event) => void = () => {}

  render() {
    const infoText =
      this.status === 'recent'
        ? 'Recent'
        : this.status === 'detected'
        ? 'Detected'
        : this.status === 'both'
        ? 'Recent'
        : ''

    return html`
      <button class="walletSelectorItem" @click=${this.onClick}>
        <img src=${this.icon} />
        <span class="walletSelectorName">${this.name}</span>
        ${infoText ? html`<span class="walletSelectorInfo">${infoText}</span>` : ''}
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nightly-wallet-selector-item': NightlyWalletSelectorItem
  }
}
