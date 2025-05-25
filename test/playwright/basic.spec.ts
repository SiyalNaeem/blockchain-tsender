import basicSetup from '../wallet-setup/basic.setup';
import { testWithSynpress } from '@synthetixio/synpress';
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright';

const test = testWithSynpress(metaMaskFixtures(basicSetup));
const {expect} = test;

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/TSender/);
});

test("should show airdrop form when connected, otherwise show connect wallet message", async ({ page, context, metamaskPage, extensionId }) => {
  await page.goto('/');
  await expect(page.getByText('Connect Wallet')).toBeVisible();

  const metamask = new MetaMask(context, metamaskPage, basicSetup.walletPassword, extensionId);
  await page.getByTestId('rk-connect-wallet').click();
  await page.getByTestId('rk-wallet-option-io.metamask').waitFor({
    state: 'visible',
    timeout: 30000 // 30 seconds
  });
  await page.getByTestId('rk-wallet-option-io.metamask').click();
  await metamask.connectToDapp();

  const customNetwork = {
    name: 'Anvil',
    rpcUrl: 'http://127.0.0.1:8545',
    chainId: 31337,
    symbol: 'ETH',
  }

  await metamask.addNetwork(customNetwork);

  await expect(page.getByText('Token Address')).toBeVisible();

  // await page.getByRole('textbox', {name: '0x', exact: true}).waitFor({
  //   state: 'visible',
  //   timeout: 30000 // 30 seconds  
  // });

});

