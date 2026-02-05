"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchMySubscriptions, subscribeTechStack, unsubscribeTechStack } from "@/lib/api/relboard";
import type { TechStackResponse } from "@/lib/api/types";
import { useAuthStore } from "@/lib/store/authStore";

type SubscriptionContext = {
  previous?: TechStackResponse[];
};

export function useSubscriptions() {
  const { user, accessToken } = useAuthStore();
  const enabled = Boolean(user && accessToken);
  const queryClient = useQueryClient();

  const subscriptionsQuery = useQuery({
    queryKey: ["my-subscriptions"],
    queryFn: async () => {
      if (!enabled) return [];
      return fetchMySubscriptions();
    },
    enabled: true,
  });

  const subscribeMutation = useMutation<
    unknown,
    Error,
    TechStackResponse,
    SubscriptionContext
  >({
    mutationFn: (stack) => subscribeTechStack(stack.id),
    onMutate: async (stack) => {
      if (!enabled) return {};
      await queryClient.cancelQueries({ queryKey: ["my-subscriptions"] });
      const previous = queryClient.getQueryData<TechStackResponse[]>([
        "my-subscriptions",
      ]);
      const current = previous ?? [];

      if (!current.some((item) => item.id === stack.id)) {
        queryClient.setQueryData(["my-subscriptions"], [...current, stack]);
      }

      return { previous };
    },
    onError: (_error, _stack, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["my-subscriptions"], context.previous);
      }
    },
    onSettled: () => {
      if (enabled) {
        queryClient.invalidateQueries({ queryKey: ["my-subscriptions"] });
      }
    },
  });

  const unsubscribeMutation = useMutation<
    unknown,
    Error,
    TechStackResponse,
    SubscriptionContext
  >({
    mutationFn: (stack) => unsubscribeTechStack(stack.id),
    onMutate: async (stack) => {
      if (!enabled) return {};
      await queryClient.cancelQueries({ queryKey: ["my-subscriptions"] });
      const previous = queryClient.getQueryData<TechStackResponse[]>([
        "my-subscriptions",
      ]);
      const current = previous ?? [];

      queryClient.setQueryData(
        ["my-subscriptions"],
        current.filter((item) => item.id !== stack.id)
      );

      return { previous };
    },
    onError: (_error, _stack, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["my-subscriptions"], context.previous);
      }
    },
    onSettled: () => {
      if (enabled) {
        queryClient.invalidateQueries({ queryKey: ["my-subscriptions"] });
      }
    },
  });

  const subscriptions = subscriptionsQuery.data ?? [];
  const subscriptionIds = new Set(subscriptions.map((item) => item.id));

  return {
    enabled,
    subscriptions,
    isLoading: subscriptionsQuery.isLoading,
    isSubscribed: (id: number) => subscriptionIds.has(id),
    subscribe: subscribeMutation,
    unsubscribe: unsubscribeMutation,
  };
}
