<?php

/** @var string $username */
/** @var string $resetPasswordUrl */

?>

<table style="border-collapse: collapse; border-spacing: 0px; width: 100%">
    <tbody>
    <tr style="border-collapse: collapse;">
        <td style="margin: 0; padding: 0; padding-bottom: 20px;">
            Bonjour <?= $username ?>,
        </td>
    </tr>
    <tr style="border-collapse: collapse;">
        <td style="margin: 0; padding: 0; padding-bottom: 20px;">
            Pour réinitialiser votre mot de passe leQuiz.io, merci de cliquer sur le bouton ci-dessous.
        </td>
    </tr>
    <tr style="border-collapse: collapse;">
        <td style="margin: 0; padding: 0; padding-bottom: 20px; text-align: center;" align="center">
            <span class="lequiz-button" style="border-width: 0px; display: inline-block; width:auto">
                <a href="<?= $resetPasswordUrl ?>"
                   style="text-decoration: none; font-size: 18px; color: #ffffff; border-style:solid; border-color: #40D9FF; border-width: 15px 25px 15px 25px; display: inline-block; background-color: #40D9FF; border-radius: 12px; font-weight: normal; font-style:normal; line-height:22px; width:auto; text-align:center"
                   target="_blank">
                    Réinitialiser mon mot de passe
                </a>
            </span>
        </td>
    </tr>
<!-- TODO MOVE THIS IN FOOTER SECTIONS    -->
    <tr style="border-collapse: collapse;">
        <td style="margin: 0; padding: 0; padding-top: 5px; font-size: 14px; color: #666">
            Si vous n'êtes pas à l'origine de la demande de réinitialisation de mot de passe, veuillez ignorer cet email.
        </td>
    </tr>
    <tr style="border-collapse: collapse;">
        <td style="margin: 0; padding: 0; padding-top: 5px; font-size: 14px; color: #666">
            Cet email vous a été envoyé automatiquement, merci de ne pas y répondre. Pour toute demande, vous pouvez nous contacter à <a href="mailto:contact@lequiz.io" style="color: #666 !important; text-decoration: underline;">contact@lequiz.io</a>.
        </td>
    </tr>
<!-- END TODO   -->
    </tbody>
</table>