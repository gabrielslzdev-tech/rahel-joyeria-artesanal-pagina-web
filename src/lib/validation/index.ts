// Esquemas Zod compartidos. Regla de seguridad #1: Zod valida TODA entrada
// (forms, API, webhooks, admin). Nada llega crudo a la DB.
// Zod se añade como dependencia cuando se construya el primer módulo con
// entrada de usuario (F1). Aquí vivirán los esquemas reutilizables.
export {};
