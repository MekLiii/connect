import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { tailwindElement } from '../../shared/tailwind.element'
import style from './nightly-selector.css'
import { SelectorView, WalletSelectorItem } from '../../utils/types'
import { styleMap } from 'lit/directives/style-map.js'
import '../nightly-desktop-main/nightly-desktop-main'
import '../nightly-connect-wallet/nightly-connect-wallet'
import '../nightly-header/nightly-header'
import '../nightly-mobile-all-wallets/nightly-mobile-all-wallets'
import '../nightly-mobile-qr/nightly-mobile-qr'
import '../nightly-mobile-main/nightly-mobile-main'
import '../nightly-footer/nightly-footer'
import { XMLOptions } from '@nightlylabs/qr-code'
import { walletsEndpoint } from '../nightly-wallet-selector-page/nightly-wallet-selector-page.config'

@customElement('nightly-selector')
export class NightlySelector extends LitElement {
  static styles = tailwindElement(style)

  // props

  @property()
  onClose = () => {
    this.remove()
  }

  @property({ type: Array })
  selectorItems: WalletSelectorItem[] = []
  @property({ type: Boolean, reflect: true })
  closeOnOverlayClick = true

  @property({ type: Function })
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onWalletClick: (name: string) => void = () => {}

  @property({ type: String })
  chainIcon = ''

  @property({ type: String })
  chainName = ''

  @property({ type: String })
  sessionId = ''

  @property({ type: String })
  relay = ''

  @property({ type: Boolean })
  connecting = false

  @property({ type: Object })
  qrConfigOverride: Partial<XMLOptions> = {}

  // state

  @state()
  fireClosingAnimation = false

  @state()
  mobileContentHeight = 182

  @state()
  link = ''

  @state()
  walletIcon = ''

  @state()
  currentWalletName = ''

  @state()
  canAnimateInitialView = false

  @state()
  currentView = SelectorView.DESKTOP_MAIN

  @state()
  isMobile = false

  // media queries

  mobileQuery = window.matchMedia('(max-width: 640px)')
  smallerMobileQuery = window.matchMedia('(max-width: 482px)')
  smallestMobileQuery = window.matchMedia('(max-width: 374px)')

  // callbacks

  calcMobileContentHeight = () => {
    switch (this.currentView) {
      case SelectorView.MOBILE_QR:
        return this.smallestMobileQuery.matches ? 332 : this.smallerMobileQuery.matches ? 420 : 510
      case SelectorView.MOBILE_ALL:
        return 526
      case SelectorView.CONNECTING:
        return this.smallestMobileQuery.matches ? 440 : this.smallerMobileQuery.matches ? 430 : 420
      default:
        return 182
    }
  }

  setCurrentView = (val: SelectorView) => {
    this.currentView = val
    this.mobileContentHeight = this.calcMobileContentHeight()
  }

  handleClose = (isOverlay: boolean) => {
    if (!this.closeOnOverlayClick && isOverlay) {
      return
    }
    this.fireClosingAnimation = true
    setTimeout(
      () => {
        this.onClose()
      },
      this.mobileQuery.matches ? 240 : 400
    )
  }

  onSelectWallet = (name: string) => {
    const wallet = this.selectorItems.find((w) => w.name === name)

    this.walletIcon = wallet?.icon ?? ''
    this.currentWalletName = wallet?.name ?? ''
    this.link = wallet?.link ?? ''

    this.setCurrentView(SelectorView.CONNECTING)

    this.canAnimateInitialView = true

    this.onWalletClick(name)
  }

  tryAgainClick = () => {
    this.onSelectWallet(this.currentWalletName)
  }

  downloadApp = () => {
    window.open(this.link, '_blank')
  }

  backToPage = () => {
    if (this.mobileQuery.matches) {
      this.setCurrentView(SelectorView.MOBILE_MAIN)
    } else {
      this.setCurrentView(SelectorView.DESKTOP_MAIN)
    }
  }

  returnToMobileInit = () => {
    this.setCurrentView(SelectorView.MOBILE_MAIN)
  }

  goToMobileQr = () => {
    this.setCurrentView(SelectorView.MOBILE_QR)
    this.canAnimateInitialView = true
  }

  goToMobileAll = () => {
    this.setCurrentView(SelectorView.MOBILE_ALL)
    this.canAnimateInitialView = true
  }
  static get observedAttributes() {
    return ['close-on-overlay-click']
  }

  // lifecycle callbacks
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    super.attributeChangedCallback(name, oldValue, newValue)
    if (name === 'close-on-overlay-click') {
      console.log(newValue)
      this.closeOnOverlayClick = newValue === 'true'
    }
  }
  connectedCallback() {
    super.connectedCallback()
    this.fetchData()
  }
  async fetchData() {
    const response = await fetch(walletsEndpoint);
    const data = await response.json();
    this.selectorItems = data;
  }

  constructor() {
    super()

    if (this.mobileQuery.matches) {
      this.isMobile = true
      this.setCurrentView(SelectorView.MOBILE_MAIN)
    }

    this.mobileQuery.addEventListener('change', () => {
      this.isMobile = this.mobileQuery.matches
      if (this.currentView !== SelectorView.CONNECTING) {
        this.setCurrentView(
          this.mobileQuery.matches ? SelectorView.MOBILE_MAIN : SelectorView.DESKTOP_MAIN
        )
      }

      this.mobileContentHeight = this.calcMobileContentHeight()
    })

    this.smallerMobileQuery.addEventListener('change', () => {
      this.mobileContentHeight = this.calcMobileContentHeight()
    })

    this.smallestMobileQuery.addEventListener('change', () => {
      this.mobileContentHeight = this.calcMobileContentHeight()
    })
  }

  disconnectedCallback(): void {
    super.disconnectedCallback()
    this.fireClosingAnimation = false
    this.canAnimateInitialView = false
    if (this.mobileQuery.matches) {
      this.setCurrentView(SelectorView.MOBILE_MAIN)
    } else {
      this.setCurrentView(SelectorView.DESKTOP_MAIN)
    }
    this.mobileContentHeight = 182
  }

  renderConnect() {
    return html`
      <nightly-connect-wallet
        id="modalConnect"
        class="nc_modalViewEntryTransition"
        .coinName=${this.currentWalletName}
        .connecting=${this.connecting}
        .tryAgainClick=${this.tryAgainClick}
        .goBack=${this.backToPage}
        .downloadApp=${this.downloadApp}
        .link=${this.link}
        .nameLink=${this.currentWalletName}
        .walletIcon=${this.walletIcon}
      ></nightly-connect-wallet>
    `
  }

  renderDesktop() {
    return html`
      <nightly-desktop-main
        id="modalDesktop"
        class="${this.canAnimateInitialView && this.currentView === SelectorView.DESKTOP_MAIN
          ? 'nc_modalViewEntryTransition'
          : ''}"
        .chainIcon=${this.chainIcon}
        .chainName=${this.chainName}
        .onWalletClick=${this.onSelectWallet}
        .selectorItems=${this.selectorItems}
        .sessionId=${this.sessionId}
        .relay=${this.relay}
        .qrConfigOverride=${this.qrConfigOverride}
      ></nightly-desktop-main>
    `
  }

  renderMobileAll() {
    return html`
      <nightly-mobile-all-wallets
        class="nc_modalViewEntryTransition"
        .goBack=${this.returnToMobileInit}
        .onWalletClick=${this.onSelectWallet}
        .selectorItems=${this.selectorItems}
      ></nightly-mobile-all-wallets>
    `
  }

  renderMobileInit() {
    return html`
      <nightly-mobile-main
        class="${this.canAnimateInitialView && this.currentView === SelectorView.MOBILE_MAIN
          ? 'nc_modalViewEntryTransition'
          : ''}"
        .sessionId=${this.sessionId}
        .showAllWallets=${this.goToMobileAll}
        .onWalletClick=${this.onSelectWallet}
        .openQrPage=${this.goToMobileQr}
        .selectorItems=${this.selectorItems}
      ></nightly-mobile-main>
    `
  }

  renderMobileQr() {
    return html`
      <nightly-mobile-qr
        class="nc_modalViewEntryTransition"
        .chainName=${this.chainName}
        .sessionId=${this.sessionId}
        .relay=${this.relay}
        .showAllWallets=${this.returnToMobileInit}
        .qrConfigOverride=${this.qrConfigOverride}
      ></nightly-mobile-qr>
    `
  }

  renderCurrent() {
    switch (this.currentView) {
      case SelectorView.DESKTOP_MAIN:
        return this.renderDesktop()
      case SelectorView.CONNECTING:
        return this.renderConnect()
      case SelectorView.MOBILE_MAIN:
        return this.renderMobileInit()
      case SelectorView.MOBILE_QR:
        return this.renderMobileQr()
      case SelectorView.MOBILE_ALL:
        return this.renderMobileAll()
    }
  }

  render() {
    return html`
      <div
        class="nc_modalOverlay ${this.fireClosingAnimation ? 'nc_modalClosingAnimation' : ''}"
        @click=${() => this.handleClose(true)}
      >
        <div
          @click=${(e: MouseEvent) => {
            e.stopPropagation()
          }}
          class="nc_modalWrapper ${this.fireClosingAnimation
            ? 'nc_modalMobileSlideOutAnimation'
            : ''}"
        >
          <nightly-header .onClose=${() => this.handleClose(false)}></nightly-header>
          <div
            class="nc_modalContent"
            style=${styleMap(
              this.isMobile
                ? {
                    height: this.mobileContentHeight + 'px'
                  }
                : {}
            )}
          >
            ${this.renderCurrent()}
          </div>
          <nightly-footer></nightly-footer>
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nightly-selector': NightlySelector
  }
}
