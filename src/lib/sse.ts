type Controller = ReadableStreamDefaultController

const clients = new Set<Controller>()

export function addClient(ctrl: Controller) {
  clients.add(ctrl)
}

export function removeClient(ctrl: Controller) {
  clients.delete(ctrl)
}

export function notifyClients() {
  for (const ctrl of clients) {
    try {
      ctrl.enqueue('data: update\n\n')
    } catch {
      clients.delete(ctrl)
    }
  }
}