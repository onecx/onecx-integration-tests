import { BffContainer, StartedBffContainer } from '../basic/onecx-bff'
import { StartedOnecxKeycloakContainer } from '../core/onecx-keycloak'

export class ParameterBffContainer extends BffContainer {
  constructor(image: string, keycloakContainer: StartedOnecxKeycloakContainer) {
    super(image, keycloakContainer)
    this.withPermissionsProductName('onecx-parameter').withNetworkAliases('onecx-parameter-bff')
  }
}

export class StartedParameterBffContainer extends StartedBffContainer {}
